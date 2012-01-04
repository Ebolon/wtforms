
var WTF = new (function ()  {
  var self = this;
  var forms = {};
  
  /*
   * Set the error handling function.
   *
   * Your function should accept 2 arguments. The first one being the
   * id of the form throwing the errors. The second an object. The
   * object will contain field id's as keys and arrays of error messages
   * as values. In case of a form-wide error it will be assigned to the 
   * id of the form itself.
   */
  this.set_error_handler = function (fn) {
    console.log("set_error_handlker");
    error_handler = fn;
  };

  /*
   * Set the translation handling functions.
   *
   * If no functions are set default english will be emitted as 
   * error messages.
   */
  this.set_gettext = function (_gettext, _ngettext) {
    gettext = _gettext;
    ngettext = _ngettext;
  };

  /*
   * Register a validation function.
   *
   * @param form       ID of the form to validate.
   * @param field      ID of the field to validate.
   * @param validator  An instance of a validation function.
   */
  this.add_validator = function (form, field, validator) {
    if (!(form in forms)) {
      forms[form] = {
        'pre':         function (form) { return true; },
        'post':        function (form) { return true; },
        'validators':  {},
      };
    }
    
    if (!(field in forms[form].validators)) {
      forms[form].validators[field] = [];
    }

    forms[form].validators[field].push(validator);
  };

  /*
   * Validate a form. In case of errors, false is returned and the
   * error handler is called. Otherwise true is returned.
   *
   * @param form       Id of the form to validate.
   */
  this.validate = function (_form) {
    var form = forms[_form];
    var errors = {};
    var has_errors = false;

    if (!form) {
      console.log("Form '%s' not found.", _form);
      return true;
    }

    if (!form.pre(_form)) {
      return false;
    }
    
    for (var field in form.validators) {
      for (var i = 0; i < form.validators[field].length; i++) {
        var rv = form.validators[field][i](form, field);
        if (rv instanceof ValidationError) {
          has_errors = true;
          if (!(field in errors)) {
            errors[field] = [];
          }
          errors[field].push(rv.message);
        } else if (rv instanceof StopValidation) {
          has_errors = true;
          if (!field in errors) {
            break;
          } else {
            if (rv.message) {
              errors[field] = [rv.message];
            } else {
              delete errors[field];
            }
            break;
          }
        } 
      }
    }

    if (!has_errors && !form.post(_form)) {
      return false;
    }

    if (has_errors) {
      console.log("submit");
      return false;
    } else {
      error_handler(_form, errors);
      return false;
    }
  };

// --------------------------------------------------------------------------
// VALIDATORS
// --------------------------------------------------------------------------
  this.Regexp = function (params) {
    var params = merge_params({
      'regex': '',
      'flags': '',
      'message': undefined,
    }, params);
    
    params.regex = new RegExp(params.regex, params.flags);

    return function (form, field) {
      if (!params.regex.test(get_value(field))) {
        return new ValidationError(!params.message ? gettext('Invalid input.') 
                                                   : params.message);
      }
      return true;
    };
  };

  this.Email = function (params) {
    var params = merge_params({
      'message': undefined
    }, params);
    return self.Regexp({
      'regex': '^.+@[^.].*\.[a-z]{2,10}$',
      'flags': 'i',
      'message': params.message,
    });
  };

  this.EqualTo = function (params) {
    var params = merge_params({
      'fieldName': undefined,
      'message': undefined,
    }, params);

    return function (form, field) {
      var val1 = get_value(field);
      var val2 = get_value(params.fieldName);

      if (!val1 || !val2) {
        return new ValidationError(gettext("Field does not exist."));
      }
      
      if (val1 !== val2) {
        return new ValidationError(gettext("Field must be equal to "
            + params.fieldName));
      }
      return true;
    };
  };

  this.Length = function (params) {
    var params = merge_params({
      'min': -1,
      'max': -1,
      'message': undefined,
    }, params);
    
    params.min = parseInt(params.min);
    params.max = parseInt(params.max);
    
    return function (form, field) {
      var l = get_value(field).length;
      if (l < params.min) {
        return new ValidationError(gettext("Field must be at least "
            + params.min + " characters long.")); 
      } else if ((params.max > -1) && (l > params.max)) {
        return new ValidationError(gettext("Field must be smaller then "
            + params.max + " characters long."));
      }
      return true;
    };
  };

  this.NumberRange = function (params) {
    var params = merge_params({
      'min': null,
      'max': null,
      'message': undefined,
    }, params);

    if (!params.min === null) {
      params.min = parseFloat(params.min);
    }
    if (!params.max === null) {
      params.max = parseFloat(params.max);
    }

    return function (form, field) {
      var val = get_value(field);
      if (isNaN(val)) {
        return new ValidationError(gettext("Value must be a number."));
      }
      
      if (params.min && (val < params.min)) {
        return new ValidationError(gettext("Value must be at least " 
            + params.min + ".")); 
      } else if (params.max && (val > params.max)) {
        return new ValidationError(gettext("Value must be at most " 
            + params.max + "."));
      }
      return true;
    };
  };

  this.IPAddress = function (params) {
    var params = merge_params({
      'message': 'Invalid IP address.',
    }, params);
    return self.Regexp({
      'regex': '^([0-9]{1,3}\.){3}[0-9]{1,3}$', 
      'message': params.message});
  };

  this.MacAddress = function (params) {
     var params = merge_params({
      'message': 'Invalid MAC address.',
    }, params);
    return self.Regexp({
      'regex': '^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$',
      'message': params.message
    });
  };

  this.URL = function (params) {
    var params = merge_params({
      'require_tld': true,
      'message': 'Invalid URL.',
    }, params);
    var tld_part = params.require_tld ? '\.[a-z]{2,10}' : '';
    var re = '^[a-z]+://([^/:]+' + tld_part 
        + '|([0-9]{1,3}\.){3}[0-9]{1,3})(:[0-9]+)?(\/.*)?$';
    
    return this.Regexp({
      'regex': re,
      'flags': 'i',
      'message': params.message,
    });
  };

  this.UUID = function (params) {
    var params = merge_params({
      'message': 'Invalid UUID.',
    }, params);
    return this.Regexp({
      'regex': '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$', 
      'message': params.message,
    });
  };

  this.AnyOf = function (params) {
    var params = merge_params({
      'values': [],
      'message': undefined,
      'values_formatter': function (v) {
        var s = '' + params.values[0];
        for (var i = 1; i < params.values.length; i++) {
          s += ', ' + params.values[i];
        }
        return s;
      },
    }, params);
    return function (form, field) {
      var val = get_value(field);
      console.log("Val %s", val);
      for (var i = 0; i < params.values.length; i++) {
        console.log("Test %s", params.values[i]);
        if (val === params.values[i]) {
          return true;
        }
      }

      return new ValidationError(gettext("Invalid value. Must be "
          + "one of " + params.values_formatter))
    };
  };
  
  this.NoneOf = function (params) {
    var params = merge_params({
      'values': [],
      'message': undefined,
      'values_formatter': function (v) {
        var s = '' + params.values[0];
        for (var i = 1; i < params.values.length; i++) {
          s += ', ' + params.values[i];
        }
        return s;
      },
    }, params);
    return function (form, field) {
      var val = get_value(field);
      console.log("Val %s", val);
      for (var i = 0; i < params.values.length; i++) {
        console.log("Test %s", params.values[i]);
        if (val === params.values[i]) {
          return new ValidationError(gettext("Invalid value. Can't be "
              + "any of " + params.values_formatter))
        }
      }
      return true;
    };
  };




// --------------------------------------------------------------------------
// PRIVATE FUNCTIONS
// --------------------------------------------------------------------------

  // Raised when a validator fails to validate its input.
  var ValidationError = function (message) {
    this.message = message;
    return this;
  };

  /*
   * Causes the validation chain to stop.
   *
   * If StopValidation is raised, no more validators in the validation chain are
   * called. If raised with a message, the message will be added to the errors
   * list.
   */
  var StopValidation = function (message) {
    this.message = message;
    return this;
  };
  
  /*
   * This function will be called after validation completes.
   *
   * @param form      The id of the form that generated the errors.
   * @param errors    An object describing the errors. It's keys will
   *                  be field id's, it's values arrays of error messages.
   *                  In case of form-wide errors, they will be added with
   *                  the id of the form as key.
   *
   * Note: This is a stub that doesn't actually do anything, you need to
   *       assign a custom function using the set_error_handler function.
   */
  var error_handler = function (form, messages) { };
  
  var gettext = function (str) {
    return str;
  };

  var ngettext = function (str) {
    return str;
  };

  var merge_params = function (defaults, params) {
    var defaults = defaults || {};
    var retval = {};
    if (!params) {
      return defaults;
    }

    for (var k in defaults) {
      if (k in params)
        retval[k] = params[k];
      else
        retval[k] = defaults[k];
    }

    return retval;
  };

  var get_value = function (id) {
    // XXX Does not properly handle non-text inputs.
    var elm = document.getElementById(id);
    if (!elm) {
      return null;
    }

    return elm.value;
  };

  /*
   * Stub console.log for IE.
   */
  /*if (typeof console == "undefined" || typeof console.log == "undefined") {
    var console = { log: function() {} }; 
  };*/

  return this;
})();

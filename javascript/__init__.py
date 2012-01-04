import wtforms
import validators
import json

class Form (wtforms.Form):

    def javascript_validators (self, form_id):
        retval = ['<script>']
        for field in self:
            for validator in field.validators:
                if not issubclass(validator.__class__, 
                        validators.JavascriptValidator):
                    continue
                retval.append("WTF.add_validator('%s', '%s', WTF.%s(%s));" %\
                    (form_id, field.id, validator.__class__.__name__,
                    json.dumps(validator.params)))
        retval.append('document.getElementById(\'%s\').onsubmit = '
                      'function () { return WTF.validate(\'%s\'); };' % (form_id,
                                                                  form_id))
        retval.append('</script>')
        return '\n'.join(retval)

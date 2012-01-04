import re

from wtforms import validators as wtv

class JavascriptValidator(object): pass

class EqualTo (JavascriptValidator, wtv.EqualTo):
    def __init__(self, fieldname, message=None):
        super(EqualTo, self).__init__ (fieldName, message=message)
        self.params = {
            'message': message,
            'fieldName': fieldName,
        }

class Length (JavascriptValidator, wtv.Length):
    def __init__(self, min=-1, max=-1, message=None):
        super(Length, self).__init__(min, max, message=message)
        self.params = {
            'min': min,
            'max': max,
            'message': message,
        }

class NumberRange (JavascriptValidator, wtv.NumberRange):
    def __init__(self, min=None, max=None, message=None):
        super(NumberRange, self).__init__(min, max, message=message)
        self.params = {
            'min': min,
            'max': max,
            'message': message
        }

class Regexp (JavascriptValidator, wtv.Regexp):
    def __init__ (self, regex, flags = 0, message = None):
        if not isinstance(regex, basestring):
            raise TypeError("Need a string.")
        self.params = {
            'regex': regex,
            'flags': '%s%s' % ('i' if flags & re.I == re.I else '',
                               'm' if flags & re.M == re.M else ''),
            'message': message,
        }
        super(Regexp, self).__init__(regex, flags, message=message)


class Email (JavascriptValidator, wtv.Email):
    def __init__ (self, message=None):
        super(Email, self).__init__(message=message)
        self.params = {
            'message': message,
        }

class IPAddress (JavascriptValidator, wtv.IPAddress):
    def __init__ (self, message=None):
        super(IPAddress, self).__init__(message=message)
        self.params = {
            'message': message,
        }

"""
class MacAddress (JavascriptValidator, wtv.MacAddress):
    def __init__ (self, message=None):
        super(MacAddress, self).__init__(message=message)
        self.params = {
            'message': message,
        }
"""

class URL (JavascriptValidator, wtv.URL):
    def __init__ (self, require_tld=True, message=None):
        super(URL, self).__init__(require_tld=require_tld, message=message)
        self.params = {
            'require_tld': require_tld,
            'message': message,
        }

class AnyOf (JavascriptValidator, wtv.AnyOf):
    def __init__(self, values, message=None, values_formatter=None):
        super(AnyOf, self).__init__(values, message=message,
                values_formatter=values_formatter)
        self.params = {
            values: values,
            message: message,
        }

class NoneOf (JavascriptValidator, wtv.NoneOf):
    def __init__(self, values, message=None, values_formatter=None):
        super(NoneOf, self).__init__(values, message=message,
                values_formatter=values_formatter)
        self.params = {
            'values': values,
            'message': message,
        }

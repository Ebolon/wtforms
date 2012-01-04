$(document).ready(function () {
  var num_tests = 0;
  var num_errors = 0;

  var run_test = function (name, validator, input, valid) {
    var tr = $('<tr />');
    var name_td = $('<td />').text(name).appendTo(tr);
    var input_td = $('<td />').text("'" + input + "'").appendTo(tr);
    var passed_td = $('<td />').appendTo(tr);

    $('#test-input').val(input);
    var result = validator('test-form', 'test-input');
    num_tests++;
    if ((result === true && valid === true)
        || (result !== true && valid !== true)) {
      passed_td.addClass('pass').text('PASS');
    } else {
      num_errors++;
      passed_td.addClass('fail').text('FAIL');
    }

    $('#results').append(tr);
  };

  var run_regexp_test = function (re, input, valid, flags) {
    var flags = flags || '';
    run_test("Regexp('" + re + "')", WTF.Regexp({
      'regex': re,
      'flags': flags,
    }), input, valid);
  };

  var run_email_test = function (address, valid) {
    run_test('Email', WTF.Email(), address, valid);
  };

  var run_length_test = function (min, max, valid) {
    run_test('Length(min=' + min + ', max=' + max +')',
      WTF.Length({'min': min, 'max': max}), 'foobar', valid);
  };

  var run_number_range_test = function (min, max, val, valid) {
    run_test('NumberRange(min=' + min + ', max=' + max + ')',
      WTF.NumberRange({'min': min, 'max': max}), val, valid);
  };

  var run_ipaddress_test = function (addr, valid) {
    run_test('IPAddress', WTF.IPAddress(), addr, valid);
  };
  
  var run_macaddress_test = function (addr, valid) {
    run_test('MacAddress', WTF.MacAddress(), addr, valid);
  };

  var run_url_test = function (url, valid, require_tld) {
    run_test('URL', WTF.URL({'require_tld': require_tld}), url, valid);
  };

  var run_uuid_test = function (uuid, valid) {
    run_test('UUID', WTF.UUID(), uuid, valid);
  };

  var run_anyof_test = function (ar, val, valid) {
    var s = '' + ar[0];
    for (var i = 1; i < ar.length; i++) {
      s += ', ' + ar[i];
    }
    run_test('AnyOf(\'' + s + '\')', WTF.AnyOf({'values': ar}), val, valid);
  };
  
  var run_noneof_test = function (ar, val, valid) {
    var s = '' + ar[0];
    for (var i = 1; i < ar.length; i++) {
      s += ', ' + ar[i];
    }
    run_test('NoneOf(\'' + s + '\')', WTF.NoneOf({'values': ar}), val, valid);
  };


  run_regexp_test('^a', 'abcd', true);
  run_regexp_test('^a', 'ABcd', true, 'i');
  run_regexp_test('^a', 'foo');
  run_regexp_test('^a', null);
  
  run_email_test('foo@bar.dk', true);
  run_email_test('123@bar.dk', true);
  run_email_test('foo@456.dk', true);
  run_email_test('foo@bar456.info', true);
  
  run_email_test(null, false);
  run_email_test('', false);
  run_email_test('foo', false);
  run_email_test('bardk', false);
  run_email_test('foo@', false);
  run_email_test('@bar.dk', false);
  run_email_test('foo@bar', false);
  run_email_test('foo@bar.ab12', false);
  run_email_test('foo@.bar.ab', false);

  run_test('EqualTo', WTF.EqualTo({'fieldName': 'test-input'}), 'foo', true);
  run_test('EqualTo', WTF.EqualTo({'fieldName': 'non_existant_field'}));
  run_test('EqualTo', WTF.EqualTo({'fieldName': 'test-compare'}), 'foo', false);

  run_length_test(2, 6, true);
  run_length_test(7, -1, false);
  run_length_test(6, -1, true);
  run_length_test(-1, 5, false);
  run_length_test(-1, 6, true);

  run_number_range_test(5, 10, '7', true);
  run_number_range_test(5, 10, '', false);
  run_number_range_test(5, 10, '0', false);
  run_number_range_test(5, 10, '12', false);
  run_number_range_test(5, 10, '-5', false);
  run_number_range_test(5, null, '500', true);
  run_number_range_test(5, null, '4', false);
  run_number_range_test(null, 50, '40', true);
  run_number_range_test(null, 50, '75', false);
  
  run_ipaddress_test('127.0.0.1', true);
  run_ipaddress_test('abc.0.0.1', false);
  run_ipaddress_test('1278.0.0.1', false);
  run_ipaddress_test('127.0.0.abc', false);
  
  run_macaddress_test('01:23:45:67:ab:CD', true);
  run_macaddress_test('00:00:00:00:00', false);
  run_macaddress_test('01:23:45:67:89:', false);
  run_macaddress_test('01:23:45:67:89:GH', false);
  run_macaddress_test('123:23:45:67:89:00', false);

  run_url_test('http://foobar.dk', true);
  run_url_test('http://foobar.dk/', true);
  run_url_test('http://foobar.museum/foobar', true);
  run_url_test('http://127.0.0.1/foobar', true);
  run_url_test('http://127.0.0.1:9000/fake', true);
  run_url_test('http://localhost/foobar', true, false);
  run_url_test('http://localhost', true, false);

  run_url_test('http://foobar', false);
  run_url_test('foobar.dk', false);
  run_url_test('http://127.0.0/asdf', false);
  run_url_test('http://foobar.d', false);
  run_url_test('http://foobar.12', false);
  run_url_test('http://localhost:abc/a', false);
  
  run_uuid_test('2bc1c94f-0deb-43e9-92a1-4775189ec9f8', true);
  run_uuid_test('2bc1c94f-deb-43e9-92a1-4775189ec9f8', false);
  run_uuid_test('2bc1c94f-0deb-43e9-92a1-4775189ec9f', false);
  run_uuid_test('gbc1c94f-0deb-43e9-92a1-4775189ec9f8', false);
  run_uuid_test('2bc1c94f 0deb-43e9-92a1-4775189ec9f8', false);
  
  run_anyof_test(['a', 'b', 'c'], 'b', true);
  run_anyof_test(['a', 'b', 'c'], null, false);
  
  run_noneof_test(['a', 'b', 'c'], 'd', true);
  run_noneof_test(['a', 'b', 'c'], 'a', false);

  $('#result')
    .addClass(num_errors == 0 ? 'pass' : 'fail')
    .text('' + num_tests + ' tests run, ' + num_errors + ' errors found.');
});

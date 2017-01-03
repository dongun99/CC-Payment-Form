'use strict';

var ccForm = function() {

    var self = {},
        _foundCardType,
        _defaultCardSpacePattern = /(?:^|\s)(\d{4})$/,
        _cardTypeFilters = [{
            //Starts with 5[1-5] or 222100-272099
            name: 'MasterCard',
            css: 'pf-mastercard',
            pattern: /^(5)[1-5]|^(2((2[2-6][1-9])|2[3-9]|[3-6]|(7[0-1])|720))/,
            numLength: 16
        }, {
            name: 'Visa',
            css: 'pf-visa',
            pattern: /^4/,
            numLength: 16
        }, {
            name: 'AmericanExpress',
            css: 'pf-american-express',
            pattern: /^3[47]/,
            spacePattern: /^(\d{4}|\d{4}\s\d{6})$/,
            numLength: 16
        }, {
            name: 'Discover',
            css: 'pf-discover',
            pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
            numLength: 16
        }];

    var cardNumberInput = document.getElementById('cardnumber'),
        cardNumberPh = document.getElementById('ph-cardnumber'),
        cvcInput = document.getElementById('cvc'),
        cvcPh = document.getElementById('ph-cvc'),
        expiryInput = document.getElementById('expiry'),
        expiryPh = document.getElementById('ph-expiry'),
        cardContainer = document.getElementById('card-container'),
        cardIconTypePh = document.getElementById('card-icon-type'),
        cardInputsContainer = document.getElementById('payment-form-container');

    function flipCard() {
        cardContainer.classList.toggle('flip');
    }

    function getCardType(cardNum) {
        var foundFilter;

        if (cardNum) {
            _cardTypeFilters.forEach(function(filter) {
                if (filter.pattern.test(cardNum)) {
                    foundFilter = filter;
                    return true;
                }
            });

            return foundFilter;
        }
    }

    function setCardTypePreview(e) {
        if (e.target.value === '') {
            _foundCardType = null;
        }

        if (_foundCardType) {
            cardIconTypePh.setAttribute('class', 'pf ' + _foundCardType.css);
        } else {
            cardIconTypePh.removeAttribute('class');
        }
    }

    function formatCardNumber(e) {
        var keyCode = e.keyCode || e.which,
            keyChar = String.fromCharCode(keyCode),
            cardSpacePattern,
            inputVal = e.target.value + keyChar;

        _foundCardType = getCardType(inputVal);
        cardSpacePattern = _foundCardType && _foundCardType.spacePattern ? _foundCardType.spacePattern : _defaultCardSpacePattern;

        if (/^\d+$/.test(keyChar)) {
            if (cardSpacePattern.test(inputVal)) {
                e.preventDefault();
                if (inputVal.length <= 19) {
                    e.target.value = inputVal + ' ';
                    e.target.selectionStart += 1;
                }
            }
        }
    }

    function filterNumberInput(e) {
        var keyCode = e.keyCode || e.which;

        // Allow: delete, backspace, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X 
            [65, 67, 86, 88].indexOf(keyCode) !== -1 && e.ctrlKey ||
            // for safari: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X 
            [97, 99, 118, 120].indexOf(keyCode) !== -1 && e.metaKey ||
            // Allow: home, end, left, right
            keyCode >= 35 && keyCode <= 39 ||
            // Allow: space bar, shift
            e.shiftKey || keyCode === 32) {
            // let it happen, don't do anything
            return;
        }

        var keyChar = String.fromCharCode(e.which);
        if (keyChar && /\d/.test(keyChar)) {
            // Ensure that it is a number 
            return;
        } else {
            e.preventDefault();
        }
    }

    function reformatDate(e) {
        var value = e.target.value,
            kCode = e.keyCode || e.which,
            parts = value.match(/^(\d+)\/?(\d*)/),
            month,
            year;

        // if no input or backspace or delete then ignore    
        if (!parts || [8, 46].indexOf(kCode) !== -1) {
            //do nothing
            return;
        }

        month = parts[1] || '';
        year = parts[2] || '';

        if (month.length < 2 && month > 1) {
            month = '0' + month;
            e.target.value = month;
            e.target.selectionStart += 1;
        } else if (month.length > 2) {
            year = month.substring(2) + year;
            month = month.substring(0, 2);
            e.target.value = month + '/' + year;
            // move the cursor over 1 since we've added the '/' char
            e.target.selectionStart += 1;
        } else if (year.length > 0) {
            e.target.value = month + '/' + year;
        } else if (month.length < 2) {
            e.target.value = month;
        } else {
            e.target.value = month + '/';
        }
    }

    function validateCardNumber(e) {
        var cardNum = e.target.value.replace(/(\s)/g, '');
        if (cardNum !== '') {
            if (!_foundCardType || cardNum.length != _foundCardType.numLength) {
                cardNumberPh.classList.add('invalid');
                return;
            }
        }

        cardNumberPh.removeAttribute('class');
    }

    function validateExpiry(e) {
        if (e.target.value !== '') {

            var parts = e.target.value.match(/^(\d+)\/?(\d*)/),
                todaysDate = new Date();

            // check for valid month
            if (!parts[1] || parseInt(parts[1]) < 1 || parseInt(parts[1]) > 12) {
                expiryPh.classList.add('invalid');
                return;
            }

            // check for valid year
            if (!parts[2] || '20' + parseInt(parts[2]) < todaysDate.getFullYear()) {
                expiryPh.classList.add('invalid');
                return;
            }

            // check for expiration
            if (parts[1] && parts[2]) {
                var cardDate = new Date('20' + parts[2], parts[1] - 1, '01');
                if (cardDate < todaysDate) {
                    expiryPh.classList.add('invalid');
                    return;
                }
            }

            expiryPh.removeAttribute('class');
        }
    }

    self.init = function(document) {

        // add event to each input to bind their matching field on the cc image    
        var formInputsNodes = [].slice.call(cardInputsContainer.querySelectorAll('input[type=text]'));

        formInputsNodes.forEach(function(input) {
            input.addEventListener('keyup', function(e) {
                document.getElementById('ph-' + input.getAttribute('id')).innerHTML = e.target.value;
            });
        });

        cardNumberInput.addEventListener('keypress', filterNumberInput);
        cardNumberInput.addEventListener('keypress', formatCardNumber);
        cardNumberInput.addEventListener('keyup', setCardTypePreview);
        cardNumberInput.addEventListener('blur', validateCardNumber);
        expiryInput.addEventListener('keypress', filterNumberInput);
        expiryInput.addEventListener('keyup', reformatDate);
        expiryInput.addEventListener('blur', validateExpiry);
        cvcInput.addEventListener('keypress', filterNumberInput);
        cvcInput.addEventListener('focus', flipCard);
        cvcInput.addEventListener('blur', flipCard);
        cvcInput.addEventListener('keyup', function(e) {
            var className = e.target.value !== '' ? 'noborder' : '';
            cvcPh.setAttribute('class', className);
        });
    };

    return self;
}();

// doc ready    
document.addEventListener('DOMContentLoaded', function() {
    ccForm.init(document);
});
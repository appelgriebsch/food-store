var customer = function () {

    'use strict';

    return {

        user_name: '',
        name: '',
        social_coins: 0,
        facebook: {
            data: {},
            expires: -1,
            token: ''
        },
        twitter: {
            data: {},
            token: '',
            secret: ''
        },
        password: '',
        type: 'Customer'
    };
};

module.exports = customer;

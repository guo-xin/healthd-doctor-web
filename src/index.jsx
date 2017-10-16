import React from 'react';
import ReactDom from 'react-dom';
import {hashHistory, Router} from 'react-router';
import {Provider} from 'react-redux';

const store = require('./redux/store');
const routes = require('./route');

ReactDom.render(
    <Provider store={store}>
        <Router history={hashHistory} routes={routes}/>
    </Provider>,
    document.getElementById("app")
);

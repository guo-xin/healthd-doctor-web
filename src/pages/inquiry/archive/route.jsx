import React from 'react';
import Waiting from './waiting';
import ExceptionalInquiry from './exceptionalInquiry';
import Todo from './todo';
import Done from './done';
import Archive from './archive';

module.exports = {
    path: 'archive',
    component: Archive,
   // indexRoute: {onEnter: (nextState, replace) => replace('/inquire/archive/waiting')},
    childRoutes: [
        {path: 'waiting', component: Waiting},
        {path: 'exceptionalInquiry', component: ExceptionalInquiry},
        {path: 'todo', component: Todo},
        {path: 'done', component: Done}
    ]
};




import Inquire from './inquire';

module.exports = {
    path: 'inquire',
    component: Inquire,
    indexRoute: { onEnter: (nextState, replace) => replace('/inquire/archive') },
    childRoutes: [
        require('./case/route'),
        require('./archive/route')
    ]
}
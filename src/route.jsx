import {requireAuthentication} from './components/auth/authenticatedComponent';
import Login from './pages/login';

const baseDir = './pages';

module.exports = {
    component: 'div',

    childRoutes: [
        {
            path: '/',
            component: requireAuthentication(require(baseDir + '/index')),
            indexRoute: {onEnter: (nextState, replace) => replace('/home')},
            childRoutes: [
                require(baseDir + '/home/route'),
                require(baseDir + '/inquiry/route'),
                require(baseDir + '/callback/route'),
                require(baseDir + '/toolbar/route'),
                require(baseDir + '/patient/route'),
                require(baseDir + '/doctor/route')
            ]
        },
        {
            path: '/login',
            component: Login
        }
    ]
};
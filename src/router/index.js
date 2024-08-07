/* eslint-disable prettier/prettier */
import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/users',
                    name: 'users',
                    component: () => import('@/views/pages/Users.vue'),
                    meta: {
                        requiredAuthorization: true, 
                        isPage: true,
                    }
                },
                {
                    path: '/customers',
                    name: 'customers',
                    component: () => import('@/views/pages/Customer.vue'),
                    meta: {
                        requiredAuthorization: true, 
                        isPage: true,
                    }
                },
                {
                    path: '/master_hutang',
                    name: 'master_hutang',
                    component: () => import('@/views/pages/MasterHutang.vue'),
                    meta: {
                        requiredAuthorization: true, 
                        isPage: true,
                    }
                },
                {
                    path: '/hutang_customer',
                    name: 'hutang_customer',
                    component: () => import('@/views/pages/HutangCustomer.vue'),
                    meta: {
                        requiredAuthorization: true, 
                        isPage: true,
                    }
                },
                {
                    path: '/rekapitulasi_hutang',
                    name: 'rekapitulasi_hutang',
                    component: () => import('@/views/pages/RekapitulasiHutang.vue'),
                    meta: {
                        requiredAuthorization: true, 
                        isPage: true,
                    }
                },
                {
                    path: '/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue'),
                    meta: {
                        isPage: true,
                    }
                },
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: {
                requiredAuthorization: false, 
                isPage: true,
            }
        },

        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: {
                requiredAuthorization: false, 
                isPage: true,
            }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
            meta: {
                requiredAuthorization: false, 
                isPage: true,
            }
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
            meta: {
                requiredAuthorization: false, 
                isPage: true,
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if(to.meta.isPage){
        if(to.path === "/login" && token != undefined){
            next("/users");
        }
        if (to.meta.requiredAuthorization) {
            if (token === undefined) {
                localStorage.removeItem('token');
                next('/login')
            }
            const base64Url = token.split('.')[1];
            if (base64Url === undefined) {
                localStorage.removeItem('token');
                next('/login')
            }else{
                next();
            }
        } else {
            next();
        }
    }else{
        if(token === undefined){
            next('/notfound');
        }else{
            next('/empty');
        }
    }
});

export default router;

/* eslint-disable prettier/prettier */
import { ref } from "vue";

/* eslint-disable prettier/prettier */
export default class MenuService {
    GetMenu() {
        if(localStorage.token){
            return ref([
                {
                    label: 'Home',
                    items: [
                        { label: 'Users', icon: 'pi pi-fw pi-users', to: '/users' },
                        { label: 'Customer', icon: 'pi pi-fw pi-id-card', to: '/customers' },
                        { label: 'Master Hutang', icon: 'pi pi-fw pi-book', to: '/master_hutang' },
                        { label: 'Hutang Customer', icon: 'pi pi-fw pi-database', to: '/hutang_customer' },
                        { label: 'Rekapitulasi Hutang', icon: 'pi pi-fw pi-print', to: '/rekapitulasi_hutang' },
                    ]
                },
            ]);
        }else{
            return ref([
                {
                    label: 'Home',
                    items: [{ label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/login' }]
                },
            ]);
        }
    }
}
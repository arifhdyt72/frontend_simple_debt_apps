<!-- eslint-disable prettier/prettier -->
<script>
import axios from 'axios';
export default {
    data() {
        return {
            users: null,
            user:{},
            data: {},
            columns: null,
            totalRecords: 0,
            loading:false,
            isLoading: false,
            params: {},
            filters: "",
            deleteDialog:false,
            usersDialog:false,
            submitted:false,
            submittedUpdate:false,
            eyeHidden: true
        }
    },
    created(){
        this.columns = [
            {field: 'name', header: 'Name', style: 'min-width:150px;'},
            {field: 'email', header: 'Email', style: 'min-width:180px;'},
            {field: 'username', header: 'Username', style: 'min-width:150px;'},
        ];
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async loadData() {
            const token = localStorage.getItem('token');
            this.loading = true;
            this.params.filters = this.filters;
            const queryParams = Object.keys(this.params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(this.params[k])).join('&');
            const response = await axios.get("v1/user?"+queryParams, {
                headers: {
					"Authorization": `Bearer ${token}`
				}
            })
            .catch(error => {
                this.loading = false;
                const result = error.response.data;
                if(result.meta.code == 401){
                    localStorage.removeItem('token');
                    this.$router.push({name: "login"});
                }else {
                    this.$toast.add({
                        severity:'error',
                        summary: 'Failed!',
                        detail: result.data.errors,
                        life: 3000
                    });
                }
            });
            if(response.data.meta.code == 200){
                const result = response.data;
                this.users = result.data.data;
                this.totalRecords = result.data.countData;
                this.loading = false;
            }
        },
        onPage(event) {
            this.params = event.originalEvent;
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.loadData();
        },
        onSort(event) {
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.loadData();
        },
        onFilter() {
            this.loadData();
        },
        refresh() {
            this.loadData();
        },
        newData(){
            this.user = {};
			this.submitted = false;
            this.submittedUpdate = false;
            this.usersDialog = true;
            this.isLoading = false;
        },
        hideDialog() {
			this.usersDialog = false;
			this.submitted = false;
            this.submittedUpdate = false;
            this.isLoading = false;
		},
        editData(data) {
			this.user = {...data};
			this.usersDialog = true;
            this.submitted = false;
            this.submittedUpdate = true;
		},
        async saveData(){
            const token = localStorage.getItem('token');
            this.isLoading = true;
            if(!this.user.ID){
                this.submitted = true;
                if(
                    this.user.username && this.user.password && this.user.email.trim() && this.user.name
                ){
                    const dataToSend = {
                        name: this.user.name,
                        username: this.user.username,
                        password: this.user.password,
                        email: this.user.email,
                    }
                    const response = await axios.post("v1/user", dataToSend, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
                    .catch(error => {
                        this.isLoading = false;
                        const result = error.response.data;
                        if(result.meta.code == 401){
                            localStorage.removeItem('token');
                            this.$router.push({name: "login"});
                        }else {
                            this.$toast.add({
                                severity:'error',
                                summary: 'Failed!',
                                detail: result.data.errors,
                                life: 5000
                            });
                        }
                    });
                    if(response.data.meta.code == 201){
                        await this.loadData();
                        const result = response.data;
                        this.usersDialog = false;
                        this.isLoading = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "User has been added!",
                            life: 3000
                        });
                    }
                }else{
                    this.isLoading = false;
                    this.$toast.add({
                        severity:'error',
                        summary: 'Failed!',
                        detail: "Input must be required!",
                        life: 3000
                    });
                }
            }else{
                this.submittedUpdate = true;
                if(
                    this.user.username.trim() && this.user.name.trim() && this.user.email.trim()
                ){
                    let dataToSend = {};
                    dataToSend.name = this.user.name;
                    if(this.user.password){
                        dataToSend.password = this.user.password;
                    }
                    dataToSend.username = this.user.username;
                    dataToSend.email = this.user.email;
                    dataToSend.id = this.user.ID;

                    const response = await axios.put("v1/user", dataToSend, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
                    .catch(error => {
                        this.isLoading = false;
                        const result = error.response.data;
                        if(result.meta.code == 401){
                            localStorage.removeItem('token');
                            this.$router.push({name: "login"});
                        }else {
                            this.isLoading = false;
                            this.$toast.add({
                                severity:'error',
                                summary: 'Failed!',
                                detail: result.data.errors,
                                life: 3000
                            });
                        }
                    });
                    if(response.data.meta.code == 200){
                        await this.loadData();
                        const result = response.data;
                        this.isLoading = false;
                        this.usersDialog = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "User has been updated!",
                            life: 3000
                        });
                    }
                }else{
                    this.isLoading = false;
                    this.$toast.add({
                        severity:'error',
                        summary: 'Failed!',
                        detail: "Input must be required!",
                        life: 3000
                    });
                }
            }
        },
        confirmDelete(data) {
            this.user = data;
			this.deleteDialog = true;
		},
        async deleteData(){
            if(this.user.ID){
                const token = localStorage.getItem('token');
                const response = await axios.delete("v1/user/"+this.user.ID, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .catch(error => {
                    this.loading = false;
                    const result = error.response.data;
                    if(result.meta.code == 401){
                        localStorage.removeItem('token');
                        this.$router.push({name: "login"});
                    }else {
                        this.$toast.add({
                            severity:'error',
                            summary: 'Failed!',
                            detail: result.data.errors,
                            life: 3000
                        });
                    }
                });
                if(response.data.meta.code == 200){
                    const result = response.data;
                    this.loading = false;
                    this.deleteDialog = false;
                    this.loadData();
                    this.$toast.add({
                        severity:'success',
                        summary: result.meta.message,
                        detail: "User has been deleted!",
                        life: 3000
                    });
                }
            }else{
                this.$toast.add({
                    severity:'error',
                    summary: 'Failed!',
                    detail: "Please reload data",
                    life: 3000
                });
            }
        },
    }
}
</script>
<!-- eslint-disable prettier/prettier -->
<template>
    <div class="grid">
        <Toast/>
        <div class="col-12">
            <router-view @refreshTable="refresh"></router-view>
        </div>
        <div class="col-12">
			<div class="card">
                <h5>Users Data</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true" 
                    :scrollable="true"
                    scrollHeight="flex"
                    :wrapper="true"
                    :rows="10"
                    :value="users" 
                    :totalRecords="totalRecords"
                    :loading="loading"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    @filter="onFilter($event)"
                    ref="dt" 
                    dataKey="id"
                    responsiveLayout="scroll" 
                >
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="my-2">
                                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="newData" />
                            </div>
                        </template>

                        <template #end>
                            <div class="flex flex-wrap gap-2 items-center justify-between">
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters" placeholder="Search..." @keydown.enter="onFilter()"/>
                                </IconField>
                            </div>
                        </template>
                    </Toolbar>
                    <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field" :sortable="true" :style="col.style" />
                    <Column headerStyle="min-width:10rem;" frozen alignFrozen="right">
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editData(slotProps.data)" />
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDelete(slotProps.data)" />
						</template>
					</Column>
                </DataTable>
                <!-- Delete Dialog -->
                <Dialog v-model:visible="deleteDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="user">Are you sure you want to delete <b>{{user.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-secondary " @click="deleteDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteData" />
					</template>
				</Dialog>
                <!-- user Dialog -->
                <Dialog v-model:visible="usersDialog" :style="{width: '550px', position: 'relatif'}" header="Form User" :modal="true" class="p-fluid">
                    <div :class=" isLoading ? 'canvas-loading loading-icon' : 'canvas-loading loading-icon-hide'">
                        <svg class="pl" width="240" height="240" viewBox="0 0 240 240">
                            <circle class="pl__ring pl__ring--a" cx="120" cy="120" r="105" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 660" stroke-dashoffset="-330" stroke-linecap="round"></circle>
                            <circle class="pl__ring pl__ring--b" cx="120" cy="120" r="35" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 220" stroke-dashoffset="-110" stroke-linecap="round"></circle>
                            <circle class="pl__ring pl__ring--c" cx="85" cy="120" r="70" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 440" stroke-linecap="round"></circle>
                            <circle class="pl__ring pl__ring--d" cx="155" cy="120" r="70" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 440" stroke-linecap="round"></circle>
                        </svg>
                    </div>
                    <div :class=" isLoading ? 'canvas-form-opacity' : 'canvas-form'">
                        <div class="grid grid-cols-12 gap-4 mb-5">
                            <div class="col-span-6">
                                <label for="username">Username</label>
                                <InputText id="username" placeholder="Username" v-model.trim="user.username" required="true" autofocus v-bind:class="{'p-invalid': submitted && !user.username}" fluid/>
                                <small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !user.username">User Name is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label for="password">Password</label>
                                <Password id="password1" placeholder="Password" :toggleMask="true" v-bind:class="submitted && !user.password ? 'p-invalid' : ''" v-model="user.password" fluid :feedback="false"></Password>
                                <small class="p-invalid-text" v-if="submitted && !user.password">Password is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <label for="fullname">Name</label>
                                <InputText id="fullname" placeholder="Name" v-model.trim="user.name" autofocus :class="{'p-invalid': submitted && !user.fullname}" fluid/>
                                <small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !user.name">Name is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label for="email">Email</label>
                                <InputText id="email" type="email" placeholder="Email" v-model.trim="user.email" autofocus :class="{'p-invalid': submitted && !user.email}" fluid/>
                                <small class="p-invalid-text" v-if="(submitted || submittedUpdate) && !user.email">Email is required.</small>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" @click="saveData" />
                    </template>
				</Dialog>
            </div>
        </div>
    </div>
</template>
<!-- eslint-disable prettier/prettier -->
<style scoped>
.p-invalid-text {
    color: red;
}
table th, table td{
 flex-basis: 1px;
}
</style>
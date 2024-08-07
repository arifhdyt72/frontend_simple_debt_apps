<!-- eslint-disable prettier/prettier -->
<script>
import axios from 'axios';
export default {
    data() {
        return {
            customers: null,
            customer:{},
            data: {},
            columns: null,
            totalRecords: 0,
            loading:false,
            isLoading: false,
            params: {},
            filters: "",
            deleteDialog:false,
            customerDialog:false,
            submitted:false,
        }
    },
    created(){
        this.columns = [
            {field: 'name', header: 'Name', style: 'min-width:150px;'},
            {field: 'email', header: 'Email', style: 'min-width:150px;'},
            {field: 'phone_number', header: 'Phone Number', style: 'min-width:150px;'},
            {field: 'address', header: 'Address', style: 'min-width:180px;'},
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
            const response = await axios.get("v1/customer?"+queryParams, {
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
                this.customers = result.data.data;
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
            this.customer = {};
			this.submitted = false;
            this.customerDialog = true;
            this.isLoading = false;
        },
        hideDialog() {
			this.customerDialog = false;
			this.submitted = false;
            this.submittedUpdate = false;
            this.isLoading = false;
		},
        editData(data) {
			this.customer = {...data};
			this.customerDialog = true;
            this.submitted = false;
		},
        async saveData(){
            const token = localStorage.getItem('token');
            this.isLoading = true;
            if(!this.customer.ID){
                this.submitted = true;
                if(
                    this.customer.name && this.customer.phone_number && this.customer.email.trim() && this.customer.address
                ){
                    const dataToSend = {
                        name: this.customer.name,
                        email: this.customer.email,
                        phone_number: this.customer.phone_number,
                        address: this.customer.address,
                    }
                    const response = await axios.post("v1/customer", dataToSend, {
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
                        this.customerDialog = false;
                        this.isLoading = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "customer has been added!",
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
                this.submitted = true;
                if(
                    this.customer.name && this.customer.phone_number && this.customer.email.trim() && this.customer.address
                ){
                    let dataToSend = {
                        id: this.customer.ID,
                        name: this.customer.name,
                        email: this.customer.email,
                        phone_number: this.customer.phone_number,
                        address: this.customer.address,
                    };

                    const response = await axios.put("v1/customer", dataToSend, {
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
                        this.customerDialog = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "Customer has been updated!",
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
            this.customer = data;
			this.deleteDialog = true;
		},
        async deleteData(){
            if(this.customer.ID){
                const token = localStorage.getItem('token');
                const response = await axios.delete("v1/customer/"+this.customer.ID, {
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
                        detail: "Customer has been deleted!",
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
                <h5>Customer Data</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true" 
                    :scrollable="true"
                    scrollHeight="flex"
                    :wrapper="true"
                    :rows="10"
                    :value="customers" 
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
						<span v-if="customer">Are you sure you want to delete <b>{{customer.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-secondary " @click="deleteDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteData" />
					</template>
				</Dialog>
                <!-- Customer Dialog -->
                <Dialog v-model:visible="customerDialog" :style="{width: '550px', position: 'relatif'}" header="Form Customer" :modal="true" class="p-fluid">
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
                                <label for="name">Name</label>
                                <InputText id="name" placeholder="Name" v-model.trim="customer.name" required="true" autofocus v-bind:class="{'p-invalid': submitted && !customer.name}" fluid/>
                                <small class="p-invalid-text" v-if="submitted && !customer.name">Name is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label for="email">Email</label>
                                <InputText id="email" placeholder="Email" v-model.trim="customer.email" autofocus :class="{'p-invalid': submitted && !customer.email}" fluid/>
                                <small class="p-invalid-text" v-if="submitted && !customer.email">Email is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <label for="phone_number">Phone number</label>
                                <InputText id="phone_number" placeholder="Phone number" v-model.trim="customer.phone_number" autofocus :class="{'p-invalid': submitted && !customer.phone_number}" fluid/>
                                <small class="p-invalid-text" v-if="submitted && !customer.phone_number">Phone number is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label for="address">Address</label>
                                <Textarea id="address" rows="4" placeholder="Address" v-model.trim="customer.address" autofocus :class="{'p-invalid': submitted && !customer.address}" fluid/>
                                <small class="p-invalid-text" v-if="submitted && !customer.address">Address is required.</small>
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
<!-- eslint-disable prettier/prettier -->
<script>
import axios from 'axios';

export default {
    data() {
        return {
            hutangs: null,
            hutang:{},
            data: {},
            columns: null,
            customerLevel: [],
            customerSelected: null,
            masterHutangLevel: [],
            masterHutangSelected: null,
            totalRecords: 0,
            loading:false,
            isLoading: false,
            params: {},
            filters: "",
            deleteDialog:false,
            hutangDialog:false,
            submitted:false,
        }
    },
    created(){
        this.columns = [
            {field: 'nama_hutang', header: 'Nama Hutang', style: 'min-width:150px;'},
            {field: 'jumlah_maksimal', header: 'Jumlah maksimal', style: 'min-width:150px;'},
            {field: 'jatuh_tempo', header: 'Jatuh Tempo', style: 'min-width:150px;'},
        ];
        this.getAllCustomer();
        this.getAllMasterHutang();
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async getAllCustomer(){
            const token = localStorage.getItem('token');
            const response = await axios.get("v1/customer_all",{
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
                result.data.forEach(item => {
                    this.customerLevel.push({
                        code: item.ID,
                        name: item.name,
                    });
                });
            }
        },
        async getAllMasterHutang(){
            const token = localStorage.getItem('token');
            const response = await axios.get("v1/master_hutang_all",{
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
                result.data.forEach(item => {
                    this.masterHutangLevel.push({
                        code: item.ID,
                        name: item.nama_hutang,
                    });
                });
            }
        },
        formatRupiah() {
            let rawValue = this.hutang.jumlah_hutang.toString().replace(/\D/g, '');
            let formatted = new Intl.NumberFormat('id-ID', {
                maximumFractionDigits: 0,
            }).format(rawValue);

            this.hutang.jumlah_hutang = formatted;
        },
        formatRupiahData(data) {
            let rawValue;
            rawValue = data.toString().replace(/\D/g, '');
            let formatted = new Intl.NumberFormat('id-ID', {
                maximumFractionDigits: 0,
            }).format(rawValue);

            return formatted;
        },
        async loadData() {
            const token = localStorage.getItem('token');
            this.loading = true;
            this.params.filters = this.filters;
            const queryParams = Object.keys(this.params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(this.params[k])).join('&');
            const response = await axios.get("v1/hutang?"+queryParams, {
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
                this.hutangs = result.data.data;
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
            this.hutang = {};
            this.hutang.jumlah_hutang = "";
            this.masterHutangSelected = null;
            this.customerSelected = null;
			this.submitted = false;
            this.hutangDialog = true;
            this.isLoading = false;
        },
        hideDialog() {
			this.masterHutangDialog = false;
			this.submitted = false;
            this.isLoading = false;
		},
        editData(data) {
			this.hutang = {...data};
            this.customerSelected = data.customer.ID;
            this.masterHutangSelected = data.master_hutang.ID;
            this.hutang.tanggal_transaksi = new Date(this.hutang.tgl_transaksi);
            this.formatRupiah();
			this.hutangDialog = true;
            this.submitted = false;
		},
        async saveData(){
            const token = localStorage.getItem('token');
            this.isLoading = true;
            if(!this.hutang.ID){
                this.submitted = true;
                if(
                    this.hutang.tanggal_transaksi && this.hutang.jumlah_hutang && this.customerSelected && this.masterHutangSelected
                ){
                    const tgl_transaksi = this.formatDate(this.hutang.tanggal_transaksi);
                    const dataToSend = {
                        customer_id: this.customerSelected,
                        master_hutang_id: this.masterHutangSelected,
                        tgl_transaksi: tgl_transaksi,
                        jumlah_hutang: parseInt(this.hutang.jumlah_hutang.replace(/\./g, '')),
                    }
                    const response = await axios.post("v1/hutang", dataToSend, {
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
                        this.hutangDialog = false;
                        this.isLoading = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "hutang customer has been added!",
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
                    this.hutang.tanggal_transaksi && this.hutang.jumlah_hutang && this.customerSelected && this.masterHutangSelected
                ){
                    const tgl_transaksi = this.formatDate(this.hutang.tanggal_transaksi);
                    let dataToSend = {
                        id: this.hutang.ID,
                        customer_id: this.customerSelected,
                        master_hutang_id: this.masterHutangSelected,
                        tgl_transaksi: tgl_transaksi,
                        jumlah_hutang: parseInt(this.hutang.jumlah_hutang.replace(/\./g, '')),
                    };

                    const response = await axios.put("v1/hutang", dataToSend, {
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
                        this.hutangDialog = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "Hutang has been updated!",
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
            this.hutang = data;
			this.deleteDialog = true;
		},
        async deleteData(){
            if(this.hutang.ID){
                const token = localStorage.getItem('token');
                const response = await axios.delete("v1/hutang/"+this.hutang.ID, {
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
                        detail: "hutang has been deleted!",
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
        formatDate(date){
            if(date == null){
                return "";
            }else{
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                
                if(day < 10){
                    day = '0'+day;
                }
                if(month < 10){
                    month = '0'+month;
                }

                return day+'/'+month+'/'+year;
            }
        },
        formatDateData(dateString) {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },
        getSeverity(status) {
            switch (status) {
                case 'overdue':
                    return 'danger';

                case 'paid':
                    return 'success';

                case 'unpaid':
                    return 'warn';
            }
        }
    }
}
</script>
<!-- eslint-disable prettier/prettier -->
<template>
    <div class="flex flex-col">
        <Toast/>
        <div class="col-12">
            <router-view @refreshTable="refresh"></router-view>
        </div>
        <div class="col-12">
			<div class="card">
                <h5>Hutang Customer</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true"
                    :rows="10"
                    :scrollable="true"
                    scrollHeight="flex"
                    :value="hutangs" 
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
                    <Column header="Nama customer" :sortable="true" style="min-width: 150px;">
                        <template #body="slotProps">
                            {{ slotProps.data.customer.name }}
                        </template>
                    </Column>
                    <Column header="Master hutang" :sortable="true" style="min-width: 150px;">
                        <template #body="slotProps">
                            {{ slotProps.data.master_hutang.nama_hutang }}
                        </template>
                    </Column>
                    <Column header="Tanggal transaksi" :sortable="true" style="min-width: 160px;">
                        <template #body="slotProps">
                            {{ formatDateData(slotProps.data.tgl_transaksi) }}
                        </template>
                    </Column>
                    <Column header="Tanggal jatuh tempo" :sortable="true" style="min-width: 180px;">
                        <template #body="slotProps">
                            {{ formatDateData(slotProps.data.tgl_jatuh_tempo) }}
                        </template>
                    </Column>
                    <Column header="Jumlah hutang" :sortable="true" style="min-width: 150px;">
                        <template #body="slotProps">
                            {{ formatRupiahData(slotProps.data.jumlah_hutang) }}
                        </template>
                    </Column>
                    <Column header="Total dibayar" :sortable="true" style="min-width: 150px;">
                        <template #body="slotProps">
                            {{ formatRupiahData(slotProps.data.total_dibayar) }}
                        </template>
                    </Column>
                    <Column header="Sisa tagihan" :sortable="true" style="min-width: 150px;">
                        <template #body="slotProps">
                            {{ formatRupiahData(slotProps.data.sisa_tagihan) }}
                        </template>
                    </Column>
                    <Column header="Status" style="min-width: 150px;">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" frozen alignFrozen="right">
						<template #body="slotProps">
							<!-- <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editData(slotProps.data)" /> -->
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDelete(slotProps.data)" />
						</template>
					</Column>
                </DataTable>
                <!-- Delete Dialog -->
                <Dialog v-model:visible="deleteDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="hutang">Are you sure you want to delete <b>{{hutang.customer.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-secondary " @click="deleteDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteData" />
					</template>
				</Dialog>
                <!-- Master Hutang Dialog -->
                <Dialog v-model:visible="hutangDialog" :style="{width: '550px', position: 'relatif'}" header="Form Hutang Customer" :modal="true" class="p-fluid">
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
                                <div class="font-regular">Nama Customer</div>
                                <Select v-model="customerSelected" :options="customerLevel" optionLabel="name" optionValue="code" placeholder="Select customer" autofocus :class="{'p-invalid': submitted && !customerSelected }" :filter="true" :style="{ width: '100%' }" />
                                <small class="p-invalid-text" v-if="submitted && !customerSelected">Customer is required.</small>
                            </div>
                            <div class="col-span-6">
                                <div class="font-regular">Master hutang</div>
                                <Select v-model="masterHutangSelected" :options="masterHutangLevel" optionLabel="name" optionValue="code" placeholder="Select master hutang" autofocus :class="{'p-invalid': submitted && !masterHutangSelected }" :filter="true" :style="{ width: '100%' }" />
                                <small class="p-invalid-text" v-if="submitted && !masterHutangSelected">Master hutang is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <div class="font-regular">Tanggal transaksi</div>
                                <DatePicker :showIcon="true" v-bind:class="submitted && !hutang.tanggal_transaksi ? 'p-invalid' : ''" :showButtonBar="true" v-model="hutang.tanggal_transaksi" :style="{ width: '100%' }"></DatePicker>
                                <small class="p-invalid" v-if="submitted && !hutang.tanggal_transaksi">Tanggal transaksi is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label for="jumlah_hutang">Jumlah hutang</label>
                                <InputText id="jumlah_hutang" placeholder="Jumlah hutang" v-model.trim="hutang.jumlah_hutang" autofocus :class="{'p-invalid': submitted && !hutang.jumlah_hutang}" fluid @keyup="formatRupiah" />
                                <small class="p-invalid-text" v-if="submitted && !hutang.jumlah_hutang">Jumlah hutang is required.</small>
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
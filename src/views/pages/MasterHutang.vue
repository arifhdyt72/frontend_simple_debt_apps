<!-- eslint-disable prettier/prettier -->
<script>
import axios from 'axios';
export default {
    data() {
        return {
            master_hutangs: null,
            master_hutang:{},
            data: {},
            columns: null,
            totalRecords: 0,
            loading:false,
            isLoading: false,
            params: {},
            filters: "",
            deleteDialog:false,
            masterHutangDialog:false,
            submitted:false,
        }
    },
    created(){
        this.columns = [
            {field: 'nama_hutang', header: 'Nama Hutang', style: 'min-width:150px;'},
            {field: 'jumlah_maksimal', header: 'Jumlah maksimal', style: 'min-width:150px;'},
            {field: 'jatuh_tempo', header: 'Jatuh Tempo', style: 'min-width:150px;'},
        ];
    },
    mounted() {
        this.loadData();
    },
    methods: {
        formatRupiah() {
            let rawValue = this.master_hutang.jumlah_maksimal.toString().replace(/\D/g, '');
            let formatted = new Intl.NumberFormat('id-ID', {
                maximumFractionDigits: 0,
            }).format(rawValue);

            this.master_hutang.jumlah_maksimal = formatted;
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
            const response = await axios.get("v1/master_hutang?"+queryParams, {
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
                this.master_hutangs = result.data.data;
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
            this.master_hutang = {};
            this.master_hutang.jumlah_maksimal = "";
			this.submitted = false;
            this.masterHutangDialog = true;
            this.isLoading = false;
        },
        hideDialog() {
			this.masterHutangDialog = false;
			this.submitted = false;
            this.isLoading = false;
		},
        editData(data) {
			this.master_hutang = {...data};
            this.formatRupiah();
			this.masterHutangDialog = true;
            this.submitted = false;
		},
        async saveData(){
            const token = localStorage.getItem('token');
            this.isLoading = true;
            if(!this.master_hutang.ID){
                this.submitted = true;
                if(
                    this.master_hutang.nama_hutang && this.master_hutang.jumlah_maksimal && this.master_hutang.jatuh_tempo
                ){
                    const dataToSend = {
                        nama_hutang: this.master_hutang.nama_hutang,
                        jumlah_maksimal: parseInt(this.master_hutang.jumlah_maksimal.replace(/\./g, '')),
                        jatuh_tempo: this.master_hutang.jatuh_tempo,
                    }
                    const response = await axios.post("v1/master_hutang", dataToSend, {
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
                        this.masterHutangDialog = false;
                        this.isLoading = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "master hutang has been added!",
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
                    this.master_hutang.nama_hutang && this.master_hutang.jumlah_maksimal && this.master_hutang.jatuh_tempo
                ){
                    let dataToSend = {
                        id: this.master_hutang.ID,
                        nama_hutang: this.master_hutang.nama_hutang,
                        jumlah_maksimal: parseInt(this.master_hutang.jumlah_maksimal.replace(/\./g, '')),
                        jatuh_tempo: this.master_hutang.jatuh_tempo,
                    };

                    const response = await axios.put("v1/master_hutang", dataToSend, {
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
                        this.masterHutangDialog = false;
                        this.$toast.add({
                            severity:'success',
                            summary: result.meta.message,
                            detail: "Master hutang has been updated!",
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
            this.master_hutang = data;
			this.deleteDialog = true;
		},
        async deleteData(){
            if(this.master_hutang.ID){
                const token = localStorage.getItem('token');
                const response = await axios.delete("v1/master_hutang/"+this.master_hutang.ID, {
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
                        detail: "Master hutang has been deleted!",
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
                <h5>Master Hutang Data</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true" 
                    :scrollable="true"
                    scrollHeight="flex"
                    :wrapper="true"
                    :rows="10"
                    :value="master_hutangs" 
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
                    <Column field="nama_hutang" header="Nama Hutang" style="min-width: 150px;"></Column>
                    <Column header="Jumlah Maksimal" style="min-width: 150px;">
                        <template #body="slotProps">
                            {{ formatRupiahData(slotProps.data.jumlah_maksimal) }}
                        </template>
                    </Column>
                    <Column field="jatuh_tempo" header="Jatuh Tempo(Hari)" style="min-width: 150px;"></Column>
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
						<span v-if="master_hutang">Are you sure you want to delete <b>{{master_hutang.nama_hutang}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-secondary " @click="deleteDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteData" />
					</template>
				</Dialog>
                <!-- Master Hutang Dialog -->
                <Dialog v-model:visible="masterHutangDialog" :style="{width: '550px', position: 'relatif'}" header="Form Master Hutang" :modal="true" class="p-fluid">
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
                                <label for="nama_hutang">Nama Hutang</label>
                                <InputText id="nama_hutang" placeholder="Nama Hutang" v-model.trim="master_hutang.nama_hutang" required="true" autofocus v-bind:class="{'p-invalid': submitted && !master_hutang.nama_hutang}" fluid/>
                                <small class="p-invalid-text" v-if="submitted && !master_hutang.nama_hutang">Nama hutang is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label for="jumlah_maksimal">Jumlah Maksimal</label>
                                <InputText id="jumlah_maksimal" placeholder="Jumlah Maksimal" v-model.trim="master_hutang.jumlah_maksimal" autofocus :class="{'p-invalid': submitted && !master_hutang.jumlah_maksimal}" fluid @keyup="formatRupiah" />
                                <small class="p-invalid-text" v-if="submitted && !master_hutang.jumlah_maksimal">Jumlah maksimal is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <label for="jatuh_tempo">Jatuh Tempo(Hari)</label>
                                <InputNumber id="jatuh_tempo" placeholder="Jatuh Tempo(Hari)" v-model="master_hutang.jatuh_tempo" autofocus :class="{'p-invalid': submitted && !master_hutang.jatuh_tempo}" showButtons mode="decimal"></InputNumber>
                                <small class="p-invalid-text" v-if="submitted && !master_hutang.jatuh_tempo">Jatuh tempo is required.</small>
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
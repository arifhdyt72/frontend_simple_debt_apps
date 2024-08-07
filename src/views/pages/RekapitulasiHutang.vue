<!-- eslint-disable prettier/prettier -->
<script>
import axios from 'axios';

export default {
    data() {
        return {
            baseUrl: "http://localhost:8082/",
            hutangs: null,
            pembayaran: {},
            totalRecords: 0,
            loading:false,
            isLoading: false,
            params: {},
            filters: "",
            bayarDialog:false,
            submitted:false,
            expandedRows: [],
            selectedFile: null,
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        formatRupiah() {
            let rawValue = this.pembayaran.total_pembayaran.toString().replace(/\D/g, '');
            let formatted = new Intl.NumberFormat('id-ID', {
                maximumFractionDigits: 0,
            }).format(rawValue);

            this.pembayaran.total_pembayaran = formatted;
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
        hideDialog() {
            this.pembayaran = {};
            this.selectedFile = null;
			this.bayarDialog = false;
			this.submitted = false;
            this.isLoading = false;
		},
        confirmTagihan(data) {
			this.pembayaran = {...data};
            this.pembayaran.jumlah_hutang = this.formatRupiahData(this.pembayaran.jumlah_hutang);
            this.pembayaran.total_dibayar = this.formatRupiahData(this.pembayaran.total_dibayar);
            this.pembayaran.sisa_tagihan = this.formatRupiahData(this.pembayaran.sisa_tagihan);
            this.selectedFile = null;
			this.bayarDialog = true;
            this.submitted = false;
		},
        async saveData(){
            const token = localStorage.getItem('token');
            this.isLoading = true;
            this.submitted = true;
            if(
                this.pembayaran.tanggal_transaksi && this.pembayaran.total_pembayaran && this.selectedFile
            ){
                const tgl_transaksi = this.formatDate(this.pembayaran.tanggal_transaksi);
                const formData = new FormData();
                formData.append('hutang_id', this.pembayaran.ID);
                formData.append('tgl_transaksi', tgl_transaksi);
                formData.append('total_dibayar', parseInt(this.pembayaran.total_pembayaran.replace(/\./g, '')));
                formData.append('file', this.selectedFile);

                const response = await axios.post("v1/pembayaran", formData, {
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
                    this.bayarDialog = false;
                    this.isLoading = false;
                    this.$toast.add({
                        severity:'success',
                        summary: result.meta.message,
                        detail: "pembayaran has been added!",
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
        },
        handleFileUpload(event) {
            this.selectedFile = event.target.files[0];
            this.pembayaran.fileName = this.selectedFile.name;
        },
        async exportData(){
            const token = localStorage.getItem('token');
            this.loading = true;
            const response = await axios.get("v1/hutang_report", {
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
                this.loading = false;
                const result = response.data;
                window.location.href = result.data.url_report;
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
                <h5>Rekapitulasi Hutang Customer</h5>
                <DataTable 
                    :lazy="true" 
                    :paginator="true"
                    :rows="10"
                    :scrollable="true"
                    :value="hutangs" 
                    :totalRecords="totalRecords"
                    :loading="loading"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    @filter="onFilter($event)"
                    ref="dt" 
                    dataKey="ID"
                    responsiveLayout="scroll"
                    tableStyle="min-width: 60rem"
                    v-model:expandedRows="expandedRows"
                >
                    <Toolbar class="mb-4">
                        <template #start>
                            <div class="my-2">
                                <Button label="Export" icon="pi pi-print" class="p-button-success mr-2" @click="exportData" />
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
                    <Column expander style="width: 5rem" />
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
							<Button v-if="slotProps.data.status != 'paid'" label="Bayar" icon="pi pi-pencil" class="p-button-rounded p-button-warning mt-2" @click="confirmTagihan(slotProps.data)" />
						</template>
					</Column>
                    <template #expansion="slotProps">
                        <div class="p-4">
                            <h5>Detail Pembayaran {{ slotProps.data.customer.name }}</h5>
                            <DataTable :value="slotProps.data.pembayaran" v-if="slotProps.data.pembayaran.length > 0">
                                <Column header="Tanggal transaksi" style="width: 150px;">
                                    <template #body="slotProps">
                                        {{ formatDateData(slotProps.data.tgl_transaksi) }}
                                    </template>
                                </Column>
                                <Column header="Total dibayar" :sortable="true" style="width: 150px;">
                                    <template #body="slotProps">
                                        {{ formatRupiahData(slotProps.data.total_dibayar) }}
                                    </template>
                                </Column>
                                <Column header="Bukti Pembayaran" :sortable="true" style="width: 170px;">
                                    <template #body="slotProps">
                                        <Image :src="`${baseUrl+slotProps.data.bukti_pembayaran}`" class="image-attachment" id="attachment-kk" alt="Image" style="width: 100px" preview />
                                    </template>
                                </Column>
                                <Column header="Status" style="min-width: 150px;">
                                    <template #body="slotProps">
                                        <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </template>
                </DataTable>
                <!-- Master Bayar Dialog -->
                <Dialog v-model:visible="bayarDialog" :style="{width: '550px', position: 'relatif'}" header="Form pembayaran" :modal="true" class="p-fluid">
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
                                <label for="nama_customer">Nama customer</label>
                                <InputText id="nama_customer" placeholder="Name customer" v-model.trim="pembayaran.customer.name" readonly style="width: 100%" />
                            </div>
                            <div class="col-span-6">
                                <label for="master_hutang">Master hutang</label>
                                <InputText id="master_hutang" placeholder="Master hutang" v-model.trim="pembayaran.master_hutang.nama_hutang" readonly style="width: 100%" />
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4 mb-5">
                            <div class="col-span-6">
                                <label for="jumlah_hutang">Jumlah hutang</label>
                                <InputText id="jumlah_hutang" placeholder="Jumlah hutang" v-model.trim="pembayaran.jumlah_hutang" readonly style="width: 100%" />
                            </div>
                            <div class="col-span-6">
                                <label for="total_dibayar">Total dibayar</label>
                                <InputText id="total_dibayar" placeholder="Total dibayar" v-model.trim="pembayaran.total_dibayar" readonly style="width: 100%" />
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4 mb-5">
                            <div class="col-span-6">
                                <label for="sisa_tagihan">Sisa tagihan</label>
                                <InputText id="sisa_tagihan" placeholder="Sisa tagihan" v-model.trim="pembayaran.sisa_tagihan" readonly style="width: 100%" />
                            </div>
                            <div class="col-span-6">
                                <div class="font-regular">Tanggal transaksi</div>
                                <DatePicker :showIcon="true" v-bind:class="submitted && !pembayaran.tanggal_transaksi ? 'p-invalid' : ''" :showButtonBar="true" v-model="pembayaran.tanggal_transaksi" :style="{ width: '100%' }"></DatePicker>
                                <small class="p-invalid" v-if="submitted && !pembayaran.tanggal_transaksi" style="color: red;">Tanggal transaksi is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-6">
                                <label for="total_pembayaran">Total pembayaran</label>
                                <InputText id="total_pembayaran" placeholder="Total dibayar" v-model.trim="pembayaran.total_pembayaran" autofocus :class="{'p-invalid': submitted && !pembayaran.total_pembayaran}" fluid @keyup="formatRupiah" />
                                <small class="p-invalid-text" v-if="submitted && !pembayaran.total_pembayaran">Total pembayaran is required.</small>
                            </div>
                            <div class="col-span-6">
                                <label>Bukti pembayaran</label><br/>
                                <input type="file" id="file-input" accept="image/*" @change="handleFileUpload" :class="{'p-invalid': submitted && !selectedFile}">
                                <label v-if="!pembayaran.fileName" for="file-input" class="file-label">Bukti Pembayaran</label>
                                <label v-if="pembayaran.fileName" for="file-input" class="file-label">{{ pembayaran.fileName }}</label>
                                <br/>
                                <small class="p-invalid-text" v-if="submitted && !selectedFile">Bukti pembayaran is required.</small>
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
.image-attachment img {
    width: 100px;
    border: 1px solid #313131;
    border-radius: 2px;
    margin: 5px 0px;
}
.p-image-preview {
    transition: transform 0.15s;
    max-width: 70vw;
    max-height: 70vh;
}
.file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

#file-input {
  display: none;
}

.file-label {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.file-label:hover {
  background-color: #2980b9;
}
</style>
<!-- eslint-disable prettier/prettier -->
<script setup>
import AppMenuItem from './AppMenuItem.vue';
import MenuService from '@/service/MenuService';

const menuService = new MenuService();
const model = menuService.GetMenu();
</script>
<!-- eslint-disable prettier/prettier -->
<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>
<!-- eslint-disable prettier/prettier -->
<style lang="scss" scoped></style>

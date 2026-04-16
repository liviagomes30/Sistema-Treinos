const fs = require('fs');

function fix(viewKey, file) {
    let content = fs.readFileSync(file, 'utf8');
    let regexStr = `<div v-else-if="page === '${viewKey}'" key="${viewKey}">`;
    content = content.replace(regexStr, `<div>`);
    let out = `<template>\n${content}\n</template>\n\n<script setup>\nimport { ref, computed } from 'vue';\nimport { useAppStore } from '../store/appStore';\nconst appStore = useAppStore();\n</script>\n`;
    fs.writeFileSync(file, out);
}

fix('history', 'src/views/HistoryView.vue');
fix('progress', 'src/views/ProgressView.vue');
fix('settings', 'src/views/SettingsView.vue');

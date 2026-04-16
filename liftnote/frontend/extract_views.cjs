const fs = require('fs');
let content = fs.readFileSync('/tmp/App.vue.txt', 'utf8');
let lines = content.split('\n');

const historyTpl = lines.slice(764, 862).join('\n');
const progressTpl = lines.slice(862, 968).join('\n');
const settingsTpl = lines.slice(968, 1061).join('\n');

const writeView = (name, tpl) => {
    // replace `v-else-if="page === 'xxxx'"` with nothing or `div`
    let cleanTpl = tpl.replace(/<div v-else-if="page === '[^']+'" key="[^"]+">/, '<div>');
    let out = `<template>\n${cleanTpl}\n</template>\n\n<script setup>\nimport { ref, computed } from 'vue';\nimport { useAppStore } from '../store/appStore';\nconst appStore = useAppStore();\n</script>\n`;
    fs.writeFileSync(`src/views/${name}.vue`, out);
}

writeView('HistoryView', historyTpl);
writeView('ProgressView', progressTpl);
writeView('SettingsView', settingsTpl);

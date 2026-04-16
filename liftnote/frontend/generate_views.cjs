const fs = require('fs');

let content = fs.readFileSync('backup.vue.txt', 'utf8');
let lines = content.split('\n');

const hTpl = lines.slice(764, 862).join('\n').replace(/<div v-else-if="page === 'history'" key="history">/, '<div>');
const pTpl = lines.slice(862, 968).join('\n').replace(/<div v-else-if="page === 'progress'" key="progress">/, '<div>');
const sTpl = lines.slice(968, 1061).join('\n').replace(/<div v-else-if="page === 'settings'" key="settings">/, '<div>');

fs.writeFileSync('src/views/HistoryView.vue', `<template>\n${hTpl}\n</template>\n\n<script setup>\nimport { ref, computed } from 'vue';\nimport { useAppStore } from '../store/appStore';\nimport { useSessionStore } from '../store/sessionStore';\nconst appStore = useAppStore();\nconst historySearch = ref('');\nconst historyFilter = ref('');\nconst filteredHistory = computed(() => []);\nfunction viewSession(s) {}\nfunction formatDate(d) { return d; }\nfunction getWorkoutName(id) { return appStore.getWorkoutName(id); }\nfunction statusLabel(s) { return s; }\nfunction formatDuration(d) { return d; }\n</script>\n`);

fs.writeFileSync('src/views/ProgressView.vue', `<template>\n${pTpl}\n</template>\n\n<script setup>\nimport { ref, computed } from 'vue';\nimport { useAppStore } from '../store/appStore';\nconst appStore = useAppStore();\nconst progressFilter = ref('volume');\nconst chartData = computed(() => []);\nconst maxChartVal = ref(100);\nfunction formatDuration(d) { return d; }\n</script>\n`);

fs.writeFileSync('src/views/SettingsView.vue', `<template>\n${sTpl}\n</template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst editUser = ref({ name: '', email: '', age: 0 });\nconst pwdForm = ref({ current: '', new: '', confirm: '' });\nconst pwdMsg = ref('');\nconst pwdMsgOk = ref(false);\nconst modal = ref(null);\n\nfunction saveProfile() {}\nfunction changePassword() {}\nfunction confirmDeleteAccount() {}\n</script>\n`);

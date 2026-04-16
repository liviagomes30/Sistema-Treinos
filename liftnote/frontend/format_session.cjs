const fs = require('fs');
let file = 'src/views/SessionView.vue';
let content = fs.readFileSync(file, 'utf8');

// Strip the outer v-else-if wrapper 
content = content.replace(/<div v-else-if="page === 'session'" key="session">/, '<div>');
content = '<template>\n' + content + '\n</template>\n\n<script setup>\nimport { ref, computed } from "vue";\nimport { useAppStore } from "../store/appStore";\nimport { useRouter } from "vue-router";\n\nconst appStore = useAppStore();\nconst router = useRouter();\n\nconst activeSession = ref(null);\nconst timerDisplay = ref("00:00");\nconst timerRunning = ref(false);\nconst activeExerciseIdx = ref(0);\nconst sessionVolume = ref(0);\nconst completedExercises = ref(0);\n\nfunction toggleTimer() {}\nfunction resetTimer() {}\nfunction finishSession() {}\nfunction cancelSession() {}\nfunction getSetStatus(s) { return "pendente"; }\nfunction exerciseComplete(e) { return false; }\n</script>\n';

fs.writeFileSync(file, content);

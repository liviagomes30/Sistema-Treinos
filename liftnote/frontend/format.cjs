const fs = require('fs');

for (const name of ['WorkoutsView', 'SessionView', 'HistoryView', 'ProgressView', 'SettingsView']) {
    let file = 'src/views/' + name + '.vue';
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Strip the outer v-else-if wrapper 
    content = content.replace(/<div v-else-if="page === '[^']+'" key="[^"]+">/, '<div>');
    content = '<template>\n' + content + '\n</template>\n\n<script setup>\nimport { computed, ref } from "vue";\nimport { useAppStore } from "../store/appStore";\nconst appStore = useAppStore();\n</script>\n';
    
    fs.writeFileSync(file, content);
}

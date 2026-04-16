#!/bin/bash
tail -n +765 /tmp/App.vue.txt | head -n 98 > src/views/HistoryView.vue
tail -n +863 /tmp/App.vue.txt | head -n 106 > src/views/ProgressView.vue
tail -n +969 /tmp/App.vue.txt | head -n 93 > src/views/SettingsView.vue

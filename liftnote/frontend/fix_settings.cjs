const fs = require('fs');
let content = fs.readFileSync('src/views/SettingsView.vue', 'utf8');
content = content.replace(/^<template>\n<template>/, '<template>');
fs.writeFileSync('src/views/SettingsView.vue', content);

<template>
    <div class="layout">
        <header class="header">
            <nav class="nav">
                <NuxtLink to="/" class="nav__brand">
                    🚀 {{ appName }}
                </NuxtLink>
            </nav>
        </header>

        <main class="main">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const appName = useState("app.name", () => "__PROJECT_NAME__");
</script>

<style scoped>
.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    border-bottom: 1px solid var(--color-border);
    padding: 0 1.5rem;
}

.nav {
    max-width: 1200px;
    margin: 0 auto;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.nav__brand {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--color-text);
}

.main {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}
</style>

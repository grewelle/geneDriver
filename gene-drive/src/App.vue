<template>
  <div>
    <div class="nav">
      <div>
        <img src="@/assets/logo.png" @click="$router.push({ path: '/input' })" style="cursor: pointer; height: 70px;">
      </div>
    </div>
    <router-view/>
  </div>
</template>

<style>
* {
  padding: 0;
  margin: 0;
  font-family: sans-serif;
  outline: none;
}

.nav {
  width: 100%;
  box-shadow: 0 0.2rem 0.4rem rgba(0,0,0,.23);
}

.nav > div {
  display: flex;
  padding: 12px;
  align-items: center;
  font-size: 35px;
  font-weight: bold;
}
</style>

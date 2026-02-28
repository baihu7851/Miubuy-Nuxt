<template>
  <!-- 頁尾：版權資訊 -->
  <footer>
    <h5 class="copyright">
      <span>© </span>baihu &amp; sonyko
    </h5>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  margin-top: 10px;
}

.copyright {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  font-family: myfont, serif;
  font-weight: lighter;
  color: #fff;
  font-size: 24px;

  span {
    font-size: 14px;
  }
}
</style>

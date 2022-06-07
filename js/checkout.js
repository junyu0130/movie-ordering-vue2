var vm = new Vue({
  el: "#app",
  data: {
    cartLength: 0,
    totalPrice: 0,
  },
  created() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    this.cartLength = params.cartLength;
    this.totalPrice = params.totalPrice;
  },
});

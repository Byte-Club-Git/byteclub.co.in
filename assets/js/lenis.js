
document.addEventListener('DOMContentLoaded', function () {
    // scroll

    var script = document.createElement('script');
    script.src = "https://unpkg.com/lenis@1.1.2/dist/lenis.min.js";

    if (!(isMobile())) {
        document.head.appendChild(script);
    }

    script.onload = function () {
        const lenis = new Lenis()
        lenis.on('scroll', (e) => {
            // console.log(e)
        })
        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)
    };

});
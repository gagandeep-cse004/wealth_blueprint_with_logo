document.getElementById('year').textContent=new Date().getFullYear();
function handleSubmit(e){e.preventDefault();alert('Thank you for reaching out! (Demo)');e.target.reset();}



// Scroll animation for strategy cards
const elements = document.querySelectorAll("[data-animate]");
const revealOnScroll = () => {
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add("visible");
        }
    });
};
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

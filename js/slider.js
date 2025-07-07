document.querySelectorAll('.photo-slider').forEach(slider => {
  const track = slider.querySelector('.slides-track');
  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.prev-button');
  const nextBtn = slider.querySelector('.next-button');
  let currentIndex = 0;

  function updateButtons() {
    prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
    nextBtn.style.display = currentIndex === slides.length - 1 ? 'none' : 'block';
  }

  function moveSlide(index) {
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    updateButtons();
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      moveSlide(currentIndex);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      moveSlide(currentIndex);
    }
  });

  moveSlide(currentIndex);
});

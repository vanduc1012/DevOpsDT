import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HeroSlider() {
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
      icon: '🌿',
      title: 'Chất lượng khởi nguồn từ những đồi trà tuyển chọn',
      description: 'Giữa những đồi trà xanh mướt trong sương sớm, "Nhà" tìm thấy nguồn cảm hứng cho hành trình của mình – nơi từng búp trà được nâng niu, chọn lọc từ những người trồng gửi gắm cả tấm lòng. Từng lá trà tươi được hái đúng thời điểm, ướp trong hương nắng, gió và niềm vui của những bàn tay cần mẫn.',
      link: '/menu',
      linkText: 'Xem thêm'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
      icon: '☕',
      title: 'Hương vị cà phê đích thực từ những hạt cà phê nguyên chất',
      description: 'Mỗi tách cà phê là một câu chuyện về đam mê và tinh tế. Chúng tôi chọn lọc từng hạt cà phê từ những vùng đất tốt nhất, rang xay thủ công để mang đến hương vị đậm đà, thơm ngon nhất. Trải nghiệm hương vị cà phê đích thực, nơi mỗi giọt cà phê đều chứa đựng tình yêu và sự chăm chút.',
      link: '/menu',
      linkText: 'Khám phá menu'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop',
      icon: '🍰',
      title: 'Không gian ấm cúng cho những khoảnh khắc đáng nhớ',
      description: 'Tại đây, mỗi góc ngồi đều được thiết kế để bạn cảm thấy thoải mái và thư giãn. Từ không gian yên tĩnh cho những cuộc trò chuyện thân mật, đến góc làm việc lý tưởng cho những ý tưởng sáng tạo. Hãy đến và tận hưởng không gian ấm cúng, nơi mỗi khoảnh khắc đều trở nên đáng nhớ.',
      link: '/book-table',
      linkText: 'Đặt bàn ngay'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="hero-slider">
      <div className="hero-slider__container">
        <div className="hero-slider__image">
          <img src={currentSlideData.image} alt={currentSlideData.title} />
          <button 
            className="hero-slider__nav hero-slider__nav--prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="hero-slider__nav hero-slider__nav--next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="hero-slider__content">
          <div className="hero-slider__icon">{currentSlideData.icon}</div>
          <h2 className="hero-slider__title">{currentSlideData.title}</h2>
          <p className="hero-slider__description">{currentSlideData.description}</p>
          <Link to={currentSlideData.link} className="hero-slider__link">
            {currentSlideData.linkText} →
          </Link>
        </div>
      </div>

      <div className="hero-slider__dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero-slider__dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSlider;


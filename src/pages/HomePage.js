import React from 'react';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/articles/ArticleCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import { seedArticles } from '../utils/seedData';

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * Home page component displaying articles in a swipeable card layout
 * @returns {JSX.Element} HomePage component
 */
function HomePage() {
  const { articles, loading, error, refetch } = useArticles(10); // Fetch 10 articles

  const handleSeed = async () => {
    try {
      await seedArticles();
      refetch();
      alert('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Error seeding database. Check console for details.');
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 flex-grow h-full"> {/* Ensure HomePage fills vertical space */}
      {/* Header/Title Section - Kept minimal for card focus */}
      {/* Title removed */}

      {loading ? (
        <div className="flex-grow flex justify-center items-center">
          <Loading size="lg" text="Loading articles..." />
        </div>
      ) : error ? (
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <ErrorMessage error={error} />
          <div className="mt-6">
            <Button onClick={refetch} variant="primary" size="lg">
              Try Again
            </Button>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
          <p className="text-gray-600 text-xl mb-4">No articles found.</p>
          <Button onClick={handleSeed} variant="primary" size="lg">
            Seed Database with Sample Articles
          </Button>
        </div>
      ) : (
        <div className="flex-grow flex justify-center overflow-hidden px-4 h-full">
          <Swiper
            modules={[Navigation, Pagination, A11y, Keyboard, Mousewheel]}
            spaceBetween={0} // Space between slides
            slidesPerView={1} // Show one main card, allow for partials
            centeredSlides={true}
            loop={articles.length > 2} // Loop if more than two articles to avoid issues with centered 'auto' slides
            navigation // Enable navigation arrows
            pagination={{ clickable: true, dynamicBullets: true }} // Enable pagination dots
            keyboard={{ enabled: true }} // Enable keyboard navigation
            mousewheel={{ forceToAxis: true }} // Enable mousewheel navigation
            grabCursor={true} // Show grab cursor
            className="w-full h-full" // Use full width and height of parent for the swiper container
            style={{
              '--swiper-navigation-color': '#007aff',
              '--swiper-pagination-color': '#007aff',
            }}
          >
            {articles.map((article) => (
              // Adjust slide width for partial preview effect.
              // This width combined with spaceBetween and centeredSlides will create the effect.
              // For example, if you want the main card to be 80% of the container:
              <SwiperSlide key={article.id} className="flex justify-center items-center !w-full">
                <div className="w-full h-full">
                  <ArticleCard article={article} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}

export default HomePage;
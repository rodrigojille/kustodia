import React from "react";
import { InstagramEmbed } from "react-social-media-embed";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const instagramPosts = [
  "https://www.instagram.com/p/DK0kuyBx734/?utm_source=ig_embed&ig_rid=f260197f-5513-4815-81a2-202ab72f7f6f",
  "https://www.instagram.com/kustodia.mx/reel/DKkhAJkxu39/",
  "https://www.instagram.com/kustodia.mx/reel/DKLjIJtRBxl/",
];

const InstagramSection: React.FC = () => (
  <section className="w-full flex flex-col items-center justify-center mt-16 mb-4">
    <span className="text-sm text-gray-500 font-medium mb-2">Conoce más en nuestras redes</span>
    <div style={{ width: 340 }}>
      <Swiper spaceBetween={20} slidesPerView={1} loop>
        {instagramPosts.map((url) => (
          <SwiperSlide key={url}>
            <InstagramEmbed url={url} width={340} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </section>
);

export default InstagramSection;

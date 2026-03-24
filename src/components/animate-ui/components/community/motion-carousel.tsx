'use client';

import { Button } from '@/components/animate-ui/components/buttons/button';
import { cn } from '@/lib/utils';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, type Transition } from 'motion/react';
import * as React from 'react';

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
  /** แทนที่ตัวเลข slide ด้วยเนื้อหา (เช่น พรีวิวการ์ด) */
  renderSlide?: (slideIndex: number) => React.ReactNode;
  onSlideChange?: (slideIndex: number) => void;
  className?: string;
  /** กำหนด CSS variables / อื่นๆ — ใช้แก้ calc ใน Tailwind ที่บางเบราว์เซอร์ parse ไม่ได้ */
  style?: React.CSSProperties;
};

type EmblaControls = {
  selectedIndex: number;
  scrollSnaps: number[];
  prevDisabled: boolean;
  nextDisabled: boolean;
  onDotClick: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

type DotButtonProps = {
  selected?: boolean;
  label: string;
  onClick: () => void;
};

const transition: Transition = {
  type: 'spring',
  stiffness: 240,
  damping: 24,
  mass: 1,
};

const useEmblaControls = (
  emblaApi: EmblaCarouselType | undefined,
  onSlideChange?: (slideIndex: number) => void,
): EmblaControls => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [prevDisabled, setPrevDisabled] = React.useState(true);
  const [nextDisabled, setNextDisabled] = React.useState(true);
  const onSlideChangeRef = React.useRef(onSlideChange);
  React.useLayoutEffect(() => {
    onSlideChangeRef.current = onSlideChange;
  });

  const onDotClick = React.useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const onNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const updateSelectionState = React.useCallback((api: EmblaCarouselType) => {
    const i = api.selectedScrollSnap();
    setSelectedIndex(i);
    setPrevDisabled(!api.canScrollPrev());
    setNextDisabled(!api.canScrollNext());
    onSlideChangeRef.current?.(i);
  }, []);

  const onInit = React.useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList());
    updateSelectionState(api);
  }, [updateSelectionState]);

  const onSelect = React.useCallback(
    (api: EmblaCarouselType) => {
      updateSelectionState(api);
    },
    [updateSelectionState],
  );

  React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    emblaApi.on('reInit', onInit).on('select', onSelect);

    return () => {
      emblaApi.off('reInit', onInit).off('select', onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    prevDisabled,
    nextDisabled,
    onDotClick,
    onPrev,
    onNext,
  };
};

function MotionCarousel(props: PropType) {
  const { slides, options, renderSlide, onSlideChange, className, style } =
    props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const {
    selectedIndex,
    scrollSnaps,
    prevDisabled,
    nextDisabled,
    onDotClick,
    onPrev,
    onNext,
  } = useEmblaControls(emblaApi, onSlideChange);

  return (
    <div
      className={cn(
        'w-full space-y-4 [--slide-height:9rem] sm:[--slide-height:13rem] md:[--slide-height:32rem] [--slide-spacing:1.5rem] [--slide-size:55%]',
        className,
      )}
      style={style}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y touch-pinch-zoom">
          {slides.map((_, slideIndex) => {
            const isActive = slideIndex === selectedIndex;

            return (
              <motion.div
                key={slideIndex}
                className="mr-[var(--slide-spacing)] flex h-[var(--slide-height)] min-h-0 min-w-0 flex-none basis-[var(--slide-size)] items-stretch"
              >
                <motion.div
                  className={cn(
                    'flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center select-none',
                    renderSlide
                      ? 'overflow-visible'
                      : 'overflow-hidden rounded-xl border-4 border-border/80 bg-muted/20',
                  )}
                  initial={false}
                  animate={{
                    /* พรีวิวการ์ด: ไม่ย่อสไลด์ข้างๆ — ลดอาการเนื้อหาดูแตก/ถูกตัดระหว่างเลื่อน */
                    scale: renderSlide ? 1 : isActive ? 1 : 0.9,
                  }}
                  transition={transition}
                >
                  {renderSlide ? (
                    renderSlide(slideIndex)
                  ) : (
                    <span className="text-3xl font-semibold md:text-5xl">
                      {slideIndex + 1}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Button size="icon" onClick={onPrev} disabled={prevDisabled}>
          <ChevronLeft className="size-5" />
        </Button>

        <div className="flex flex-wrap justify-end items-center gap-2">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              label={`Slide ${index + 1}`}
              selected={index === selectedIndex}
              onClick={() => onDotClick(index)}
            />
          ))}
        </div>

        <Button size="icon" onClick={onNext} disabled={nextDisabled}>
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

function DotButton({ selected = false, label, onClick }: DotButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      initial={false}
      className="flex cursor-pointer select-none items-center justify-center rounded-full border-none bg-primary text-primary-foreground text-sm"
      animate={{
        width: selected ? 68 : 12,
        height: selected ? 28 : 12,
      }}
      transition={transition}
    >
      <motion.span
        layout
        initial={false}
        className="block whitespace-nowrap px-3 py-1"
        animate={{
          opacity: selected ? 1 : 0,
          scale: selected ? 1 : 0,
          filter: selected ? 'blur(0)' : 'blur(4px)',
        }}
        transition={transition}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}

export { MotionCarousel };

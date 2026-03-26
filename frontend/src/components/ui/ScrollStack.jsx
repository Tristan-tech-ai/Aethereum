import React, { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

export const ScrollStackItem = ({ children, itemClassName = '', itemStyle = {} }) => (
  <div
    className={`scroll-stack-card relative w-full my-8 rounded-[32px] box-border origin-top will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      background: 'rgba(12,9,28,0.97)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
      padding: '2.5rem 3rem',
      ...itemStyle,
    }}
  >
    {children}
  </div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller ? scroller.scrollTop : 0,
        containerHeight: scroller ? scroller.clientHeight : 0,
        scrollContainer: scroller,
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element) => {
      // Always use offsetTop for container-scroll mode.
      // For window-scroll mode this is only used for endElement (no transforms applied to it,
      // so offsetParent traversal is accurate there).
      return element.offsetTop;
    },
    []
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    // In window-scroll mode: endElement has no transforms, so BCR + scrollY is accurate.
    // In container mode: use offsetTop relative to container.
    const endElement = useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scrollerRef.current?.querySelector('.scroll-stack-end');

    const endElementTop = endElement
      ? (useWindowScroll
          ? (endElement.getBoundingClientRect().top + window.scrollY)
          : getElementOffset(endElement))
      : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      // For window-scroll mode: BCR gives visual viewport top.
      // Natural (un-transformed) document top = BCR.top + scrollY - appliedTranslateY.
      // Subtracting the applied transform makes this immune to the feedback loop.
      // For container mode: use offsetTop (accurate relative to container).
      const appliedTranslateY = lastTransformsRef.current.get(i)?.translateY ?? 0;
      const cardTop = useWindowScroll
        ? (card.getBoundingClientRect().top + window.scrollY - appliedTranslateY)
        : getElementOffset(card);

      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jApplied = lastTransformsRef.current.get(j)?.translateY ?? 0;
          const jCardTop = useWindowScroll
            ? (cardsRef.current[j].getBoundingClientRect().top + window.scrollY - jApplied)
            : getElementOffset(cardsRef.current[j]);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      // Cards below the first one start invisible and fade in only as they approach
      // their trigger point (i.e. when the card before them has begun to pin).
      let opacity = 1;
      if (i > 0) {
        const fadeStart = triggerStart - containerHeight * 0.9;
        const fadeEnd   = triggerStart - containerHeight * 0.3;
        opacity = Math.max(0, Math.min(1, (scrollTop - fadeStart) / Math.max(1, fadeEnd - fadeStart)));
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
        opacity: Math.round(opacity * 1000) / 1000,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1 ||
        Math.abs((lastTransform.opacity ?? 1) - newTransform.opacity) > 0.005;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
        card.style.opacity = String(newTransform.opacity);
        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, rotationAmount, blurAmount, useWindowScroll, onStackComplete,
    calculateProgress, parsePercentage, getScrollData, getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      // Use a RAF loop — runs every frame, so transforms are applied on every repaint
      // regardless of scroll event timing. Much more reliable than a scroll listener.
      const rafLoop = () => {
        updateCardTransforms();
        animationFrameRef.current = requestAnimationFrame(rafLoop);
      };
      animationFrameRef.current = requestAnimationFrame(rafLoop);
      lenisRef.current = { destroy: () => {} }; // no-op for cleanup consistency
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector('.scroll-stack-inner'),
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        gestureOrientation: 'vertical',
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      });
      lenis.on('scroll', handleScroll);
      const raf = (time) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;
    }
  }, [handleScroll, useWindowScroll, updateCardTransforms]);

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : (scrollerRef.current?.querySelectorAll('.scroll-stack-card') ?? [])
    );
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange = 'transform, filter, opacity';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
      // Non-first cards start invisible; they fade in as user scrolls to them
      if (i > 0) card.style.opacity = '0';
    });

    setupLenis();
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (lenisRef.current) lenisRef.current.destroy();
      stackCompletedRef.current = false;      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance, itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, scaleDuration, rotationAmount, blurAmount, useWindowScroll,
    onStackComplete, setupLenis, updateCardTransforms,
  ]);

  return (
    <div
      className={`relative w-full ${!useWindowScroll ? 'overflow-y-auto overflow-x-visible' : ''} ${className}`.trim()}
      ref={scrollerRef}
      style={useWindowScroll ? {
        // In window-scroll mode, this is a plain container — window drives scroll
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      } : {
        // In container mode, this IS the scroll container
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'scroll-position',
      }}
    >
      <div
        className={`scroll-stack-inner max-w-5xl mx-auto px-4 ${
          useWindowScroll
            ? 'pt-[15vh] pb-[50rem]'
            : 'pt-[20vh] pb-[50rem] min-h-screen'
        }`}
      >
        {children}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;

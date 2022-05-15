import Hammer from 'hammerjs';
import { useUndoRedo } from 'hooks/useUndoRedo';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Colors } from '@blueprintjs/core';
import { update } from '@tweenjs/tween.js';

import {
  canvasAtom,
  mousePositionAtom,
  offsetAtom,
  plotCanvasAtom,
} from '../../atoms/atoms';
import { copyAtom, pasteAtom } from '../../atoms/clipboardAtom';
import { deleteAtom } from '../../atoms/deleteAtom';
import { drawableAreaAtom } from '../../atoms/drawableAreaAtom';
import { panAtom } from '../../atoms/panAtom';
import { panStartAtom } from '../../atoms/panStartAtom';
import { tapAtom } from '../../atoms/tapAtom';
import { zoomAtom } from '../../atoms/zoomAtom';
import { Badge } from '../badge/Badge';
import { Creatable } from '../creatable/Creatable';
import { Guides } from '../guides/Guides';
import { Info } from '../info/Info';
import { SelectionArea } from '../selectionArea/SelectionArea';
import { Objects } from '../shapes/Objects';
import { SnapLines } from '../snapLines/SnapLines';
import { Zoom } from '../zoom/Zoom';
import styles from './DrawableArea.module.scss';

function animate(time: number) {
  requestAnimationFrame(animate);
  update(time);
}
requestAnimationFrame(animate);

export const DrawableArea = () => {
  // useUndoRedo();

  const rootRef = useRef<HTMLDivElement>(null);

  const [plotCanvas] = useAtom(plotCanvasAtom);
  const [offset] = useAtom(offsetAtom);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [canvas, setCanvas] = useAtom(canvasAtom);
  const setTap = useUpdateAtom(tapAtom);
  const setPan = useUpdateAtom(panAtom);
  const setPanStart = useUpdateAtom(panStartAtom);
  const setDrawableArea = useUpdateAtom(drawableAreaAtom);
  const setMousePosition = useUpdateAtom(mousePositionAtom);

  const copy = useUpdateAtom(copyAtom);
  const paste = useUpdateAtom(pasteAtom);
  const del = useUpdateAtom(deleteAtom);

  useHotkeys('ctrl+c, cmd+c', () => void copy());
  useHotkeys('ctrl+v, cmd+v', () => void paste());
  useHotkeys('delete, backspace', () => void del());

  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      setZoom({
        center: {
          x: event.clientX,
          y: event.clientY,
        },
        delta: event.deltaY,
      });
    },
    [setZoom]
  );

  const onMouseMove = useCallback(
    ({ clientX, clientY }: MouseEvent) => {
      setMousePosition({ x: clientX, y: clientY });
    },
    [setMousePosition]
  );

  const onMouseLeave = useCallback(() => {
    setMousePosition(null);
  }, [setMousePosition]);

  useEffect(() => {
    const $root = rootRef.current;
    const mc = new Hammer.Manager(rootRef.current!);

    if ($root) {
      $root.addEventListener('wheel', onWheel);
      $root.addEventListener('mousemove', onMouseMove);
      $root.addEventListener('mouseleave', onMouseLeave);

      mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
      mc.add(new Hammer.Tap({ event: 'tap', taps: 1 }));
      mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
      mc.add(new Hammer.Pinch({ pointers: 2, threshold: 0, enable: true }));

      mc.get('doubletap').recognizeWith('tap');

      mc.on('panstart', (e) => {
        setPanStart({ center: e.center });
      });

      mc.on('panend', () => {
        setPanStart(null);
      });

      mc.on('pan', ({ deltaX, deltaY, center, offsetDirection, target }) => {
        setPan({ deltaX, deltaY, center, direction: offsetDirection });
      });

      mc.on('tap', (event) => {
        setTap({
          center: {
            x: event.center.x,
            y: event.center.y,
          },
          shiftPressed: event.srcEvent.shiftKey,
        });
      });

      mc.on('doubletap', (event) => {
        setZoom({
          direction: 'zoomIn',
          center: { x: event.center.x, y: event.center.y },
          withTween: true,
        });
      });
    }
    return () => {
      mc.off('panstart pan panend panmove tap doubletap');
      $root!.removeEventListener('wheel', onWheel);
      $root!.removeEventListener('mousemove', onMouseMove);
      $root!.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [
    setPan,
    setPanStart,
    setZoom,
    onWheel,
    onMouseMove,
    setTap,
    onMouseLeave,
  ]);

  const recalculateDrawableAreaDimensions = useCallback(() => {
    if (rootRef.current) {
      const { width, height, x, y } = rootRef.current.getBoundingClientRect();
      setCanvas({ width, height, x, y });
      setDrawableArea();
    }
  }, [setDrawableArea, setCanvas]);

  useLayoutEffect(() => {
    const $root = rootRef.current;

    if ($root) {
      const observer = new ResizeObserver(recalculateDrawableAreaDimensions);

      observer.observe($root);

      return () => {
        observer.disconnect();
      };
    }
  }, [setDrawableArea, recalculateDrawableAreaDimensions]);

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.inside}>
        {!isEmpty(canvas) && !isEmpty(plotCanvas) && (
          <>
            <Info />
            <svg
              className={styles.svg}
              viewBox={`
                ${offset.x} 
                ${offset.y} 
                ${canvas.width / zoom} 
                ${canvas.height / zoom}
              `}
              style={{ display: 'block' }}
            >
              <rect
                width={plotCanvas.width}
                height={plotCanvas.height}
                fill="#fff"
                stroke={Colors.GRAY4}
                strokeWidth={1 / zoom}
                strokeDasharray={4 / zoom}
              />
              <Objects />
              <Creatable />
              <SnapLines />
              <Guides />
              <Badge />
              <SelectionArea />
            </svg>
          </>
        )}
      </div>
      <Zoom />
    </div>
  );
};

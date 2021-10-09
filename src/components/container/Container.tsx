import Hammer from 'hammerjs';
import { useCallback, useEffect, useRef } from 'react';
import { update } from '@tweenjs/tween.js';
import { useAtom } from 'jotai';
import styles from './Container.module.css';
import {
  canvasAtom,
  offsetAtom,
  plotCanvasAtom,
  mousePositionAtom,
} from '../../atoms/atoms';
import { Guides } from '../guides/Guides';
import { Creatable } from '../creatable/Creatable';
import { panAtom } from '../../atoms/panAtom';
import { panStartAtom } from '../../atoms/panStartAtom';
import { zoomAtom } from '../../atoms/zoomAtom';
import { Objects } from '../shapes/Objects';
import { initialAtom } from '../../atoms/initialAtom';
import { tapAtom } from '../../atoms/tapAtom';
import { useUpdateAtom } from 'jotai/utils';
import { Info } from '../info/Info';
import { useHotkeys } from 'react-hotkeys-hook';
import { copyAtom, pasteAtom } from '../../atoms/clipboardAtom';
import { deleteAtom } from '../../atoms/deleteAtom';
import { SnapLines } from '../snapLines/SnapLines';
import isEmpty from 'lodash.isempty';
import { Badge } from '../badge/Badge';
import { SelectionArea } from '../selectionArea/SelectionArea';

function animate(time: number) {
  requestAnimationFrame(animate);
  update(time);
}
requestAnimationFrame(animate);

export const Container = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [plotCanvas] = useAtom(plotCanvasAtom);
  const [offset] = useAtom(offsetAtom);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [canvas] = useAtom(canvasAtom);
  const setTap = useUpdateAtom(tapAtom);
  const setPan = useUpdateAtom(panAtom);
  const setPanStart = useUpdateAtom(panStartAtom);
  const [initial, setInitial] = useAtom(initialAtom);
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
    ({ offsetX, offsetY, clientX, clientY }: MouseEvent) => {
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

      mc.on('pan', ({ deltaX, deltaY, center, offsetDirection }) => {
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

  useEffect(() => {
    if (rootRef.current && !initial) {
      const { width, height, x, y } = rootRef.current.getBoundingClientRect();
      setInitial({
        canvas: { width, height, x, y },
      });
    }
  }, [setInitial, initial]);

  return (
    <div ref={rootRef} className={styles.root}>
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
              stroke="#333"
              strokeWidth={1 / zoom}
              strokeDasharray={4 / zoom}
            />
            <Guides />
            <Objects />
            <Creatable />
            <SnapLines />
            <Badge />
            <SelectionArea />
            {/* <PlantUnderCursor /> */}
          </svg>
        </>
      )}
    </div>
  );
};

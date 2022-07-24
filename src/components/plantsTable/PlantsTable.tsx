import { plantsAtom, varietiesAtom } from 'atoms/atoms';
import { atom, useAtom, useAtomValue } from 'jotai';
import { HTMLTable } from '@blueprintjs/core';
import { PlantsTableRow } from './PlantsTableRow';
import { groupBy } from 'lodash';
import { useMemo } from 'react';
import { PlantsTableVarietyRow } from './PlantsTableVarietyRow';
import { Variety, PlantDetails } from 'types';
import { useUpdateAtom } from 'jotai/utils';
import { VarietyUpdateModal } from './VarietyUpdateModal';

export type VarietyModalParams = {
  variety?: Variety;
  plant: PlantDetails;
  mode: 'create' | 'edit';
  isOpen: boolean;
  onSave(
    params: Pick<
      PlantDetails,
      'rowSpacing' | 'inRowSpacing' | 'name' | 'maturity'
    >
  ): void;
};

const _varietyModalAtom = atom<VarietyModalParams>({} as VarietyModalParams);

export const varietyModalAtom = atom<
  VarietyModalParams,
  Partial<VarietyModalParams>
>(
  (get) => get(_varietyModalAtom),
  (_, set, payload) => {
    set(_varietyModalAtom, (prev) => ({
      ...prev,
      ...payload,
    }));
  }
);

export const PlantsTable = () => {
  const [varietyModal, setVarietyModal] = useAtom(varietyModalAtom);

  const plants = useAtomValue(plantsAtom);
  const varieties = useAtomValue(varietiesAtom);

  const groupedVarieties = useMemo(
    () => groupBy(varieties, ({ plantId }) => plantId),
    [varieties]
  );

  return (
    <div style={{ padding: '15px 20px', flex: '1' }}>
      <HTMLTable bordered striped style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th style={{ width: '150px' }}>In Reihe (cm)</th>
            <th style={{ width: '175px' }}>Zwischen Reihen (cm)</th>
            <th style={{ width: '175px' }}>Kulturdauer (Wochen)</th>
          </tr>
        </thead>
        <tbody>
          {plants.map((plant) => {
            const plantVarieties = groupedVarieties[plant.id];

            const result = [
              <PlantsTableRow plant={plant} key={`plant-${plant.id}`} />,
            ];

            if (plantVarieties?.length > 0) {
              plantVarieties.forEach((variety) => {
                result.push(
                  <PlantsTableVarietyRow
                    key={`variety-${variety.id}`}
                    variety={variety}
                    plant={plant}
                  />
                );
              });
            }

            return result;
          })}
        </tbody>
      </HTMLTable>

      {varietyModal.isOpen && <VarietyUpdateModal {...varietyModal} />}
    </div>
  );
};

import { useMediaQuery } from '@/hooks/use-media-query';
import { Grip } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Icon } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

export type Item = {
  group: string;
  id: string;
  label: string;
};

type ListContainerProps = {
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    item: Item,
    source: 'available' | 'selected',
    selectedSet: Set<string>,
  ) => void;
  handleDrop: (
    e: React.DragEvent<HTMLDivElement>,
    target: 'available' | 'selected',
  ) => void;
  handleSelect: (itemId: string, isAvailable: boolean) => void;
  isAvailable: boolean;
  items: Item[];
  onTransfer: (items: Item[], direction: 'left' | 'right') => void;
  selected: Set<string>;
  title: string;
};

type MultiSelectTransferProps = {
  availableItems: Item[];
  description: string;
  onTransfer: (selectedItems: Item[], direction: 'left' | 'right') => void;
  selectedItems: Item[];
  title: string;
};

const ListContainer = React.memo(
  ({
    handleDragOver,
    handleDragStart,
    handleDrop,
    handleSelect,
    isAvailable,
    items,
    onTransfer,
    selected,
    title,
  }: ListContainerProps) => {
    const handleTransferAllVisible = React.useCallback(() => {
      onTransfer(items, isAvailable ? 'right' : 'left');
    }, [items, isAvailable, onTransfer]);

    const groupedItems = React.useMemo(() => {
      const map: Record<string, Item[]> = {};
      for (const item of items) {
        if (!map[item.group]) {
          map[item.group] = [];
        }
        map[item.group]?.push(item);
      }
      return map;
    }, [items]);

    const sortedGroups = React.useMemo(() => {
      const entries = Object.entries(groupedItems);
      entries.sort(([groupA], [groupB]) => groupA.localeCompare(groupB));
      return entries;
    }, [groupedItems]);

    return (
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <Button
            disabled={items.length === 0}
            onClick={handleTransferAllVisible}
            size="sm"
            variant="ghost"
          >
            {isAvailable ? 'Select All' : 'Deselect All'}
          </Button>
        </div>
        <div
          className="min-h-[300px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, isAvailable ? 'available' : 'selected')}
        >
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search actions..." />
            <CommandList className="max-h-[240px]">
              <CommandEmpty>No results found.</CommandEmpty>
              {sortedGroups.map(([groupName, groupItems]) => (
                <CommandGroup heading={groupName} key={groupName}>
                  {groupItems.map((item) => (
                    <CommandItem
                      className="flex items-center space-x-2 px-4 py-2 cursor-move"
                      draggable
                      key={item.id}
                      onDragStart={(e) =>
                        handleDragStart(
                          e,
                          item,
                          isAvailable ? 'available' : 'selected',
                          selected,
                        )
                      }
                      value={`${item.label} ${item.group}`}
                    >
                      <Label className="w-full h-full flex items-center gap-2">
                        <Checkbox
                          checked={selected.has(item.id)}
                          onCheckedChange={() =>
                            handleSelect(item.id, isAvailable)
                          }
                        />
                        <span className="flex-1">{item.label}</span>
                      </Label>
                      <Grip className="h-4 w-4 opacity-50" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </div>
      </div>
    );
  },
);

ListContainer.displayName = 'ListContainer';

export const MultiSelectTransfer: React.FC<MultiSelectTransferProps> = ({
  availableItems,
  onTransfer,
  selectedItems,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [availableSelected, setAvailableSelected] = React.useState<Set<string>>(
    new Set(),
  );
  const [selectedSelected, setSelectedSelected] = React.useState<Set<string>>(
    new Set(),
  );

  const handleSelect = React.useCallback(
    (itemId: string, isAvailable: boolean) => {
      if (isAvailable) {
        setAvailableSelected((prev) => {
          const next = new Set(prev);
          next.has(itemId) ? next.delete(itemId) : next.add(itemId);
          return next;
        });
      } else {
        setSelectedSelected((prev) => {
          const next = new Set(prev);
          next.has(itemId) ? next.delete(itemId) : next.add(itemId);
          return next;
        });
      }
    },
    [],
  );

  const handleDragStart = React.useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      item: Item,
      source: 'available' | 'selected',
      selectedSet: Set<string>,
    ) => {
      e.stopPropagation();

      const sourceItems =
        source === 'available' ? availableItems : selectedItems;
      let itemsToDrag: Item[] = [];

      if (selectedSet.size > 1 && selectedSet.has(item.id)) {
        itemsToDrag = sourceItems.filter((srcItem) =>
          selectedSet.has(srcItem.id),
        );
      } else {
        itemsToDrag = [item];
      }

      const dragPreview = document.createElement('div');
      dragPreview.style.position = 'absolute';
      dragPreview.style.top = '-99999px';
      dragPreview.style.left = '-99999px';
      dragPreview.style.background = 'white';
      dragPreview.style.border = '1px solid #ccc';
      dragPreview.style.padding = '8px';
      dragPreview.style.borderRadius = '4px';
      dragPreview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      dragPreview.style.fontSize = '14px';
      dragPreview.style.fontFamily = 'sans-serif';

      itemsToDrag.forEach((dragItem, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = dragItem.label;
        itemDiv.style.marginBottom =
          index === itemsToDrag.length - 1 ? '0' : '4px';
        dragPreview.appendChild(itemDiv);
      });

      document.body.appendChild(dragPreview);

      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ items: itemsToDrag, source }),
      );
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setDragImage(dragPreview, 0, 0);

      const eventTarget = e.currentTarget;

      const handleDragEnd = () => {
        if (dragPreview?.parentNode) {
          dragPreview.parentNode.removeChild(dragPreview);
        }

        eventTarget.removeEventListener('dragend', handleDragEnd);
      };

      eventTarget.addEventListener('dragend', handleDragEnd);
    },
    [availableItems, selectedItems],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    [],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>, target: 'available' | 'selected') => {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { items, source } = data;
        if (source !== target) {
          onTransfer(items, source === 'available' ? 'right' : 'left');
          if (source === 'available') {
            setAvailableSelected(new Set());
          } else {
            setSelectedSelected(new Set());
          }
        }
      } catch (_error) {
        // TODO: handle error
      }
    },
    [onTransfer],
  );

  const transferItems = React.useCallback(
    (direction: 'left' | 'right') => {
      const itemsToTransfer =
        direction === 'right'
          ? availableItems.filter((item) => availableSelected.has(item.id))
          : selectedItems.filter((item) => selectedSelected.has(item.id));

      onTransfer(itemsToTransfer, direction);

      if (direction === 'right') {
        setAvailableSelected(new Set());
      } else {
        setSelectedSelected(new Set());
      }
    },
    [
      availableItems,
      selectedItems,
      availableSelected,
      selectedSelected,
      onTransfer,
    ],
  );

  const TransferButtons = React.useMemo(
    () => (
      <div
        className={`flex ${
          isMobile
            ? 'flex-row justify-center space-x-2'
            : 'flex-col space-y-2 pt-16'
        }`}
      >
        <Button
          disabled={availableSelected.size === 0}
          onClick={() => transferItems('right')}
          size="sm"
          title="Move selected to right"
        >
          <Icon
            name={isMobile ? 'chevron-down-outline' : 'chevron-right-outline'}
          />
        </Button>
        <Button
          disabled={selectedSelected.size === 0}
          onClick={() => transferItems('left')}
          size="sm"
          title="Move selected to left"
        >
          <Icon
            name={isMobile ? 'chevron-up-outline' : 'chevron-left-outline'}
          />
        </Button>
      </div>
    ),
    [availableSelected.size, selectedSelected.size, transferItems, isMobile],
  );

  return (
    <div className={`flex flex-col ${!isMobile ? 'md:flex-row' : ''} gap-4`}>
      <ListContainer
        handleDragOver={handleDragOver}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        handleSelect={handleSelect}
        isAvailable={true}
        items={availableItems}
        onTransfer={onTransfer}
        selected={availableSelected}
        title="Available actions"
      />

      {TransferButtons}

      <ListContainer
        handleDragOver={handleDragOver}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        handleSelect={handleSelect}
        isAvailable={false}
        items={selectedItems}
        onTransfer={onTransfer}
        selected={selectedSelected}
        title="Selected actions"
      />
    </div>
  );
};

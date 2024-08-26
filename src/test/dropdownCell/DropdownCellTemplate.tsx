import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Select, { MenuProps, OptionProps, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";
import {
  CellTemplate,
  Compatible,
  DropdownCell,
  getCellProperty,
  getCharFromKey,
  isAlphaNumericKey,
  keyCodes,
  OptionType,
  Uncertain,
  UncertainCompatible,
} from "src/core";

type Override<Type, NewType> = Omit<Type, keyof NewType> & NewType;

export type CustomDropdownCell = Override<
  DropdownCell,
  {
    selectedValue?: string | { id: number; text: string };
    values?: OptionType[];
    key?: string;
    searchType?: { key: string };
  }
>;

export class CustomDropdownCellTemplate
  implements CellTemplate<CustomDropdownCell>
{
  getCompatibleCell(
    uncertainCell: Uncertain<CustomDropdownCell>,
  ): Compatible<CustomDropdownCell> {
    let selectedValue: CustomDropdownCell["selectedValue"];
    try {
      if (typeof uncertainCell.selectedValue === "object") {
        selectedValue = getCellProperty(
          uncertainCell,
          "selectedValue",
          "object",
        );
      } else
        selectedValue = getCellProperty(
          uncertainCell,
          "selectedValue",
          "string",
        );
    } catch {
      selectedValue = undefined;
    }

    const values: OptionType[] | undefined = uncertainCell["values"];

    const value =
      typeof selectedValue === "object" // typeof selectedValue === 'object' 일 경우 다뤄야 하나?
        ? parseFloat(selectedValue.text)
        : typeof selectedValue === "string"
          ? parseFloat(selectedValue)
          : NaN;

    let isDisabled = true;
    try {
      isDisabled = getCellProperty(uncertainCell, "isDisabled", "boolean");
    } catch {
      isDisabled = false;
    }

    let inputValue: string | undefined;
    try {
      inputValue = getCellProperty(uncertainCell, "inputValue", "string");
    } catch {
      inputValue = undefined;
    }

    let isOpen: boolean;
    try {
      isOpen = getCellProperty(uncertainCell, "isOpen", "boolean");
    } catch {
      isOpen = false;
    }

    const text =
      typeof selectedValue === "object"
        ? selectedValue.text
        : selectedValue || "";

    let key: string | undefined;
    try {
      key = getCellProperty(uncertainCell, "key", "string");
    } catch {
      key = undefined;
    }

    return {
      ...uncertainCell,
      selectedValue,
      text,
      value,
      values,
      isDisabled,
      isOpen,
      inputValue,
      key,
    };
  }

  update(
    cell: Compatible<CustomDropdownCell>,
    cellToMerge: UncertainCompatible<CustomDropdownCell>,
  ): Compatible<CustomDropdownCell> {
    // update는 cell.values가 있을 때만
    const selectedValueFromText = (cell.values as OptionType[])?.some(
      (val) => val.value === cellToMerge.text,
    )
      ? cellToMerge.text
      : undefined;

    return this.getCompatibleCell({
      ...cell,
      selectedValue: selectedValueFromText,
      isOpen: cellToMerge.isOpen,
      inputValue: cellToMerge.inputValue,
    });
  }

  getClassName(
    cell: Compatible<CustomDropdownCell>,
    _isInEditMode: boolean,
  ): string {
    const isOpen = cell.isOpen ? "open" : "closed";
    return `${cell.className ? cell.className : ""}${isOpen}`;
  }

  handleKeyDown(
    cell: Compatible<CustomDropdownCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    key: string,
    capsLock: boolean,
  ): { cell: Compatible<CustomDropdownCell>; enableEditMode: boolean } {
    if ((keyCode === keyCodes.SPACE || keyCode === keyCodes.ENTER) && !shift) {
      return {
        cell: this.getCompatibleCell({ ...cell, isOpen: !cell.isOpen }),
        enableEditMode: false,
      };
    }

    const char = getCharFromKey(key, shift, capsLock);

    if (
      !ctrl &&
      !alt &&
      isAlphaNumericKey(keyCode) &&
      !(shift && keyCode === keyCodes.SPACE)
    )
      return {
        cell: this.getCompatibleCell({
          ...cell,
          inputValue: char,
          isOpen: !cell.isOpen,
        }),
        enableEditMode: false,
      };

    return { cell, enableEditMode: false };
  }

  handleCompositionEnd(
    cell: Compatible<CustomDropdownCell>,
    eventData: string,
  ): { cell: Compatible<CustomDropdownCell>; enableEditMode: boolean } {
    return {
      cell: { ...cell, inputValue: eventData, isOpen: !cell.isOpen },
      enableEditMode: false,
    };
  }

  render(
    cell: Compatible<CustomDropdownCell>,
    _isInEditMode: boolean,
    onCellChanged: (
      cell: Compatible<CustomDropdownCell>,
      commit: boolean,
    ) => void,
  ): React.ReactNode {
    return cell.isDisabled ? (
      <DisabledDropdownInput
        cell={cell}
        onCellChanged={(cell) =>
          onCellChanged(this.getCompatibleCell(cell), true)
        }
      />
    ) : (
      <ActiveDropdownInput
        cell={cell}
        onCellChanged={(cell) =>
          onCellChanged(this.getCompatibleCell(cell), true)
        }
      />
    );
  }
}

interface DIProps {
  onCellChanged: (cell: Compatible<CustomDropdownCell>) => void;
  cell: Compatible<CustomDropdownCell>;
}

const DisabledDropdownInput = ({ cell, onCellChanged }: DIProps) => (
  <DefaultSelect cell={cell} onCellChanged={onCellChanged} />
);

const ActiveDropdownInput = ({ onCellChanged, cell }: DIProps) => {
  const selectRef = useRef<SelectInstance<OptionType>>(null);

  const [inputValue, setInputValue] = useState<string | undefined>(
    cell.inputValue,
  );
  const [isAsyncLoading, setAsyncIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (cell.isOpen && selectRef.current) {
      selectRef.current.focus();
      setInputValue(cell.inputValue);
    }
  }, [cell.isOpen, cell.inputValue]);

  const isAsyncSelect = !cell.values?.length;
  // const SelectOrAsyncSelect = isAsyncSelect ? AsyncSelect : Select;

  const loadOptions = (inputValue?: string) => {
    setAsyncIsLoading(true);
    return new Promise<OptionType[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            label: "test1",
            value: "test1",
          },
          {
            label: "test2",
            value: "test2",
          },
        ]);
        setAsyncIsLoading(false);
      }, 1000);
    });
  };

  const AsyncSelectProps = {
    loadOptions,
    defaultOptions: true,
    isLoading: isAsyncLoading,
    cacheOptions: true,
  };

  return (
    <DefaultSelect
      ref={selectRef}
      cell={cell}
      onCellChanged={onCellChanged}
      {...(cell.inputValue && {
        inputValue,
        defaultInputValue: inputValue,
        onInputChange: (e) => setInputValue(e),
      })}
      {...(isAsyncSelect ? { ...AsyncSelectProps } : { options: cell.values })}
    />
  );
};

const CustomOption = ({
  innerProps,
  label,
  isSelected,
  isFocused,
  isDisabled,
}: OptionProps<OptionType, false>) => (
  <div
    {...innerProps}
    onPointerDown={(e) => e.stopPropagation()}
    className={`rg-dropdown-option${isSelected ? " selected" : ""}${
      isFocused ? " focused" : ""
    }${isDisabled ? " disabled" : ""}`}
  >
    {label}
  </div>
);

const CustomMenu = ({ innerProps, children }: MenuProps<OptionType, false>) => (
  <div
    {...innerProps}
    className="rg-dropdown-menu"
    onPointerDown={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

type DefaultSelectProps = DIProps & {
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (e: string) => void;
} & (
    | { options?: OptionType[] }
    | {
        loadOptions?: () => Promise<OptionType[]>;
        isLoading?: boolean;
        cacheOptions?: boolean;
      }
  );

const DefaultSelect = forwardRef<
  SelectInstance<OptionType>,
  DefaultSelectProps
>(function DefaultSelect(
  { onCellChanged, cell, ...additionalProps },
  forwardedRef,
) {
  const selectRef = useRef<SelectInstance<OptionType>>(null);
  // 부모 컴포넌트에서 참조할 ref의 기능을 selectRef.current로 고정시킴

  const selectedValue = useMemo<OptionType | undefined>(
    () => cell.values?.find((val) => val.value === cell.text),
    [cell.text, cell.values],
  );

  const isAsyncSelect = !cell.values?.length;
  const SelectOrAsyncSelect = isAsyncSelect ? AsyncSelect : Select;

  return (
    <div
      style={{ width: "100%" }}
      onPointerDown={() =>
        !cell.isDisabled && onCellChanged({ ...cell, isOpen: true })
      }
    >
      <SelectOrAsyncSelect
        {...additionalProps}
        ref={selectRef}
        defaultValue={selectedValue}
        value={selectedValue}
        isDisabled={cell.isDisabled}
        isSearchable={true}
        isClearable={true}
        blurInputOnSelect={true}
        closeMenuOnScroll={true}
        {...(cell.isOpen !== undefined && { menuIsOpen: cell.isOpen })}
        onMenuClose={() =>
          onCellChanged({
            ...cell,
            isOpen: !cell.isOpen,
            inputValue: undefined,
          })
        }
        onMenuOpen={() => onCellChanged({ ...cell, isOpen: true })}
        onChange={(e) =>
          onCellChanged({
            ...cell,
            selectedValue: (e as OptionType)?.value,
            isOpen: false,
            inputValue: undefined,
          })
        }
        onKeyDown={(e) => {
          e.stopPropagation();

          if (e.key === "Escape") {
            selectRef?.current?.blur();
            return onCellChanged({
              ...cell,
              isOpen: false,
              inputValue: undefined,
            });
          }
        }}
        components={{
          Option: CustomOption,
          Menu: CustomMenu,
        }}
        styles={{
          container: (provided) => ({
            ...provided,
            width: "100%",
            height: "100%",
            ...cell.styles?.container,
          }),
          control: (provided) => ({
            ...provided,
            border: "none",
            borderColor: "transparent",
            minHeight: "25px",
            background: "transparent",
            boxShadow: "none",
            ...cell.styles?.control,
          }),
          indicatorsContainer: (provided) => ({
            ...provided,
            paddingTop: "0px",
            ...cell.styles?.indicatorsContainer,
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            padding: "0px 4px",
            ...cell.styles?.dropdownIndicator,
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "inherit",
            ...cell.styles?.singleValue,
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            marginTop: "4px",
            marginBottom: "4px",
            ...cell.styles?.indicatorSeparator,
          }),
          input: (provided) => ({
            ...provided,
            padding: 0,
            ...cell.styles?.input,
          }),
          valueContainer: (provided) => ({
            ...provided,
            padding: "0 8px",
            ...cell.styles?.valueContainer,
          }),
        }}
      />
    </div>
  );
});

import React, { FunctionComponent, memo } from "react"
import { SearchHeader } from "../Search/SearchHeader"
import { IOptions, Select } from "../Input/Select"
import cs from "classnames"
import styleCardsExplorer from "../Exploration/CardsExplorer.module.scss"
import { SearchInputControlled } from "../Input/SearchInputControlled"
import styleSearch from "../Input/SearchInput.module.scss"
import layout from "../../styles/Layout.module.scss"
import { FiltersPanel } from "../Exploration/FiltersPanel"
import { CardsExplorer } from "../Exploration/CardsExplorer"
import { ExploreTagDef, ExploreTags } from "../Exploration/ExploreTags"
import { Spacing } from "../Layout/Spacing"
import { CardSizeSelect } from "../Input/CardSizeSelect"

interface SortAndFiltersChildren {
  refCardsContainer: (node?: Element | null | undefined) => void
}

interface SortAndFiltersProps {
  children: FunctionComponent<SortAndFiltersChildren>
  sort: {
    value: string
    options: IOptions[]
    onChange: (value: string) => void
  }
  initialSearchQuery?: string
  renderFilters?: () => any
  filterTags: ExploreTagDef[]
  onClearAllTags: () => void
  onSearch: (query: string) => void
  noResults: boolean
  cardSizeScope?: string
}

const _SortAndFilters = ({
  children,
  sort,
  initialSearchQuery,
  renderFilters,
  onSearch,
  noResults,
  filterTags,
  onClearAllTags,
  cardSizeScope,
}: SortAndFiltersProps) => {
  return (
    <CardsExplorer cardSizeScope={cardSizeScope}>
      {({
        filtersVisible,
        setFiltersVisible,
        inViewCardsContainer,
        refCardsContainer,
        isSearchMinimized,
        setIsSearchMinimized,
        cardSize,
        setCardSize,
      }) => (
        <>
          <SearchHeader
            hasFilters={!!renderFilters}
            showFiltersOnMobile={inViewCardsContainer}
            filtersOpened={filtersVisible}
            onToggleFilters={() => setFiltersVisible(!filtersVisible)}
            sortSelectComp={
              <Select
                classNameRoot={cs({
                  [styleCardsExplorer["hide-sort"]]: !isSearchMinimized,
                })}
                value={sort.value}
                options={sort.options}
                onChange={sort.onChange}
              />
            }
            sizeSelectComp={
              cardSizeScope && (
                <CardSizeSelect value={cardSize} onChange={setCardSize} />
              )
            }
          >
            <SearchInputControlled
              minimizeBehavior="mobile"
              initialValue={initialSearchQuery}
              onMinimize={setIsSearchMinimized}
              onSearch={onSearch}
              className={styleSearch.large_search}
            />
          </SearchHeader>

          <div className={cs(layout.cards_explorer, layout["padding-big"])}>
            <FiltersPanel
              open={filtersVisible}
              onClose={() => setFiltersVisible(false)}
            >
              {renderFilters?.()}
            </FiltersPanel>

            <div style={{ width: "100%" }}>
              {(filterTags || []).length > 0 && (
                <>
                  <ExploreTags terms={filterTags} onClearAll={onClearAllTags} />
                  <Spacing size="regular" />
                </>
              )}

              {noResults && <span>No results</span>}

              {children({ refCardsContainer })}
            </div>
          </div>
        </>
      )}
    </CardsExplorer>
  )
}

_SortAndFilters.defaultProps = {
  filterTags: [],
  onClearAllTags: () => {},
}
export const SortAndFilters = memo(_SortAndFilters)

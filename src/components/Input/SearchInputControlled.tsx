import cs from "classnames"
import { useState } from "react"
import { SearchInput } from "./SearchInput"

interface Props {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

/**
 * This is a wrapper component that encapsulates the state in which
 * the input value is stored, because the higher order component
 * might not need it at all
 */
export function SearchInputControlled({
  placeholder = "search by artist name, tags, title...",
  onSearch,
  className,
}: Props) {
  const [value, setValue] = useState<string>("")

  return (
    <SearchInput
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      onSearch={onSearch}
      className={cs(className)}
    />
  )
}
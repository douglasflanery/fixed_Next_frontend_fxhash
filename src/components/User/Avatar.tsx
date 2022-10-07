import style from "./Avatar.module.scss"
import effect from "../../styles/Effects.module.scss"
import cs from "classnames"
import { Image } from "../Image"
import { MediaImage } from "../../types/entities/MediaImage"

interface Props {
  uri: string | null | undefined
  className?: string
  isInline?: boolean
  image?: MediaImage
  imageSizes?: string
}

const DEFAULT_AVATAR_IMAGE_SIZE = "64px"

export function Avatar({
  image,
  uri,
  className,
  isInline,
  imageSizes = DEFAULT_AVATAR_IMAGE_SIZE,
}: Props) {
  const Container = isInline ? "span" : "div"
  return (
    <Container
      className={cs(style.container, effect["drop-shadow-small"], className)}
    >
      <Image image={image} ipfsUri={uri} alt="" sizes={imageSizes} />
    </Container>
  )
}

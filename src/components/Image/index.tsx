import css from "./Image.module.scss"
import cs from "classnames"
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  EGatewayIpfs,
  ipfsCidFromUriOrCid,
  ipfsGatewayUrl,
} from "../../services/Ipfs"
import { MediaImage } from "../../types/entities/MediaImage"

// a list of common sizes which will be used to fetch the resource, ensuring
// we hit the cache as often as possible
const sizes = [
  8, 16, 32, 64, 128, 256, 512, 768, 1024, 1536, 2048, 2560, 3072, 4196,
]

// the image display mode, depends on the context of the parent and how the
// image should be displayed, required to display a proper blur effect
// - contain: wrapper takes full width and height available, and image is set
//            to be contained in the available area
// - cover: same as above, but cover
// - responsive: image will take the full available width, and the height
//               proportionnal to its size
type TImageMode = "contain" | "cover" | "responsive"

const getImageApiUrl = (cid: string, width: number) =>
  `${process.env.NEXT_PUBLIC_API_MEDIA_ROOT}/w_${width}/${cid}`

interface ISize {
  width: number
  height: number
}

interface BaseImageProps {
  ipfsUri?: string | null
  alt: string
  mode?: TImageMode
  style?: CSSProperties
}

export interface FxImageProps extends BaseImageProps {
  image?: MediaImage
  alt: string
  mode?: TImageMode
  // if set to true, only the original image will be loaded
  trueResolution?: boolean
  style?: CSSProperties
  // if the image should have position absolute, it should be set by this prop
  // instead of through the CSS, this is because we use a ::after element to
  // achieve the blur effect
  position?: "absolute"
  onLoadingComplete?: () => void
  onError?: () => void
  className?: string
}

export function Image(props: FxImageProps) {
  const { image, ipfsUri, alt, mode, style } = props

  // top condition to avoid any computations if there is no img
  if (!image && !ipfsUri) return null

  // if there is no image element available (or if not processed yet), just
  // display the image from the source directly
  if (!image || !image.width || !image.height || !image.placeholder) {
    return <SimpleImage ipfsUri={ipfsUri} alt={alt} mode={mode} style={style} />
  }

  return <ReactiveImage {...props} />
}

function SimpleImage({
  ipfsUri,
  alt,
  mode = "contain",
  style,
  ...restProps
}: BaseImageProps) {
  const gatewayUrl = useMemo(
    () => ipfsGatewayUrl(ipfsUri!, EGatewayIpfs.FXHASH),
    [ipfsUri]
  )

  return (
    <img
      src={gatewayUrl}
      alt={alt}
      style={{
        objectFit:
          mode === "contain"
            ? "contain"
            : mode === "cover"
            ? "cover"
            : undefined,
        width: "100%",
        height: "100%",
        ...style,
      }}
      {...restProps}
      loading="lazy"
    />
  )
}

function ReactiveImage({
  image,
  ipfsUri,
  alt,
  trueResolution,
  mode = "contain",
  onLoadingComplete,
  onError,
  style,
  position,
  ...restProps
}: FxImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<boolean>(false)

  const gatewayUrl = useMemo(
    () => ipfsGatewayUrl(ipfsUri!, EGatewayIpfs.FXHASH),
    [ipfsUri]
  )

  // keep a reference to the highest size loaded
  const highestWidth = useRef(0)

  // returns the viewport available space based on the wrapper viewport
  // dimensions, or [1, 1] if ref doesn't exist
  const getViewportSpace: () => ISize = useCallback(() => {
    if (ref.current) {
      const bounds = ref.current.getBoundingClientRect()
      return {
        width: bounds.width * (window.devicePixelRatio || 1),
        height: bounds.height * (window.devicePixelRatio || 1),
      }
    }
    return {
      width: 1,
      height: 1,
    }
  }, [])

  const updateImageUrl = useCallback(() => {
    // no media element = pull image from IPFS directly
    if (!image) {
      setUrl(ipfsGatewayUrl(ipfsUri, EGatewayIpfs.FXHASH))
      return
    }

    // compute available space and load the appropriate image accordingly
    const space = getViewportSpace()
    // find the best width based on available space
    let width = sizes[sizes.length - 1]
    for (const w of sizes) {
      if (w > space.width) {
        width = w
        break
      }
    }

    // if target size is greater than the highest size loaded, we update
    if (width > highestWidth.current) {
      highestWidth.current = width
      const imageUrl = getImageApiUrl(image?.cid, width)
      setUrl(imageUrl)
    }
  }, [])

  // attach a resize observer to the element, which will eventually fetch a
  // higher resolution image if needed
  useEffect(() => {
    // if we want to keep the original image media, just set URL to IPFS
    if (trueResolution) {
      setUrl(gatewayUrl)
      return
    }

    if (ref.current) {
      const observer = new ResizeObserver(() => {
        updateImageUrl()
      })
      observer.observe(ref.current)

      return () => {
        ref.current && observer.disconnect()
      }
    }
  }, [image, ipfsUri, gatewayUrl])

  // triggers an error if an image has not yet been loaded
  const triggerError = useCallback(() => {
    !loaded && onError?.()
  }, [loaded])

  // when the image is loaded
  const isLoaded = useCallback(() => {
    setLoaded(true)
  }, [])

  return (
    <div
      ref={ref}
      className={cs(css.wrapper, css[`wrapper_${mode}`], {
        [css.loading]: !loaded,
      })}
      style={{
        backgroundImage: loaded ? undefined : `url("${image?.placeholder}")`,
        position: position,
        paddingTop:
          mode === "responsive"
            ? `${(image!.height! / image!.width!) * 100}%`
            : undefined,
      }}
    >
      {url && (
        <img
          src={url}
          alt={alt}
          style={{
            objectFit: mode === "contain" ? "contain" : "cover",
            ...style,
          }}
          {...restProps}
          onLoad={isLoaded}
          onError={triggerError}
          loading="lazy"
        />
      )}
    </div>
  )
}

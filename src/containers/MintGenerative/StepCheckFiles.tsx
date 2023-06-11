import style from "./StepCheckFiles.module.scss"
import layout from "../../styles/Layout.module.scss"
import cs from "classnames"
import { StepComponent } from "../../types/Steps"
import { Spacing } from "../../components/Layout/Spacing"
import {
  ArtworkIframe,
  ArtworkIframeRef,
} from "../../components/Artwork/PreviewIframe"
import { useMemo, useState, useRef } from "react"
import { HashTest } from "../../components/Testing/HashTest"
import { Checkbox } from "../../components/Input/Checkbox"
import { Button } from "../../components/Button"
import { RawFeatures } from "../../components/Features/RawFeatures"
import { ArtworkFrame } from "../../components/Artwork/ArtworkFrame"
import { ipfsUrlWithHashAndParams } from "../../utils/ipfs"
import { ControlsTest } from "components/Testing/ControlsTest"
import { serializeParams, sumBytesParams } from "components/FxParams/utils"
import { useReceiveTokenInfos } from "hooks/useReceiveTokenInfos"
import { MinterTest } from "components/Testing/MinterTest"
import { FxParamsData } from "components/FxParams/types"

export const StepCheckFiles: StepComponent = ({ onNext, state }) => {
  const [check1, setCheck1] = useState<boolean>(false)
  const [check2, setCheck2] = useState<boolean>(false)
  const artworkIframeRef = useRef<ArtworkIframeRef>(null)
  const { onIframeLoaded, features, runtime, dispatch } =
    useReceiveTokenInfos(artworkIframeRef)

  const inputBytes = useMemo<string | null>(() => {
    const serialized = serializeParams(
      runtime.state.params,
      runtime.definition.params || []
    )
    if (serialized.length === 0) return null
    return serialized
  }, [runtime.details.stateHash.soft, runtime.definition.params])

  const url = useMemo<string>(() => {
    return ipfsUrlWithHashAndParams(
      state.cidUrlParams!,
      runtime.state.hash,
      runtime.state.minter,
      inputBytes
    )
  }, [state.cidUrlParams, runtime.state, inputBytes])

  const nextStep = () => {
    onNext({
      previewHash: runtime.state.hash,
      previewMinter: runtime.state.minter,
      previewInputBytes: inputBytes,
      params: {
        definition: runtime.definition.params,
        inputBytesSize: sumBytesParams(runtime.definition.params || []),
      },
    })
  }

  const handleSubmitParams = (data: any) => {
    runtime.state.update({ params: data })
  }

  const softDispatchParams = (params: FxParamsData) => {
    dispatch("fxhash_params:update", { params })
  }

  return (
    <>
      <p>
        Now, double-check your Generative Token to see if it behaves properly on
        the IPFS network. <br />
        Sometimes, the IPFS network can be <strong>slow</strong> 🐢. Please be
        patient.
      </p>
      <p>
        On the next step, you will configure how previews will be generated each
        time your token is collected.
        <br />
        <strong>
          Use this step to find a hash you want to use for the thumbnail of the
          project on the platform.
        </strong>
      </p>

      <Spacing size="5x-large" sm="small" />

      <div className={cs(style.container)}>
        <div>
          <h5>Testing</h5>
          <p>You need to verify that:</p>
          <ul>
            <li>
              a same hash will <strong>always</strong> generate the same output
            </li>
            <li>
              different hashes generate <strong>different</strong> outputs
            </li>
          </ul>

          <Spacing size="3x-large" sm="x-large" />

          <HashTest
            autoGenerate={false}
            value={runtime.state.hash}
            onHashUpdate={(hash) => runtime.state.update({ hash })}
            onRetry={() => {
              artworkIframeRef.current?.reloadIframe()
            }}
          />
          <Spacing size="large" sm="x-large" />

          <MinterTest
            autoGenerate={false}
            value={runtime.state.minter}
            onMinterUpdate={(minter) => runtime.state.update({ minter })}
            onRetry={() => {
              artworkIframeRef.current?.reloadIframe()
            }}
          />
          <Spacing size="2x-large" sm="x-large" />

          {runtime.definition.params && (
            <div>
              <h5>Params</h5>
              <Spacing size="small" />
              <ControlsTest
                definition={runtime.definition.params}
                params={runtime.state.params}
                onSubmit={handleSubmitParams}
                onSoftSubmit={softDispatchParams}
              />
            </div>
          )}
          <Spacing size="2x-large" sm="x-large" />
          <div>
            <h5>Features</h5>
            <Spacing size="small" />
            <RawFeatures rawFeatures={features} />
          </div>
        </div>
        <div className={layout.hide_sm}>
          <div className={cs(style.artworkWrapper)}>
            <div className={cs(style.artwork)}>
              <div className={cs(style["preview-cont"])}>
                <div className={cs(style["preview-wrapper"])}>
                  <ArtworkFrame>
                    <ArtworkIframe
                      ref={artworkIframeRef}
                      url={url}
                      textWaiting="looking for content on IPFS"
                      onLoaded={onIframeLoaded}
                    />
                  </ArtworkFrame>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Spacing size="6x-large" sm="x-large" />

      <div className={cs(style.checkboxes)}>
        <div>
          <Checkbox value={check1} paddingLeft={false} onChange={setCheck1}>
            I want to keep these settings for the preview of my project
          </Checkbox>
          <Checkbox value={check2} paddingLeft={false} onChange={setCheck2}>
            My Generative Token works properly
          </Checkbox>
        </div>
        <Spacing size="large" sm="regular" />

        <Button
          color="secondary"
          iconComp={<i aria-hidden className="fas fa-arrow-right" />}
          iconSide="right"
          size="large"
          disabled={!check1 || !check2}
          onClick={nextStep}
          className={style.button}
        >
          next step
        </Button>
      </div>

      <Spacing size="3x-large" />
      <Spacing size="3x-large" sm="none" />
      <Spacing size="3x-large" sm="none" />
    </>
  )
}

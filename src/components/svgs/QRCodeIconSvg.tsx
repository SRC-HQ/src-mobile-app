import * as React from 'react'
import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

const QRCodeIconSvg = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x={3} y={3} width={8} height={8} rx={1} stroke="currentColor" strokeWidth={2} />
    <Rect x={13} y={3} width={8} height={8} rx={1} stroke="currentColor" strokeWidth={2} />
    <Rect x={3} y={13} width={8} height={8} rx={1} stroke="currentColor" strokeWidth={2} />
    <Path d="M15 13h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm0-2h2v2h-2v-2z" fill="currentColor" />
  </Svg>
)

export default QRCodeIconSvg

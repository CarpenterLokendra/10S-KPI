interface AdsterraFrameProps {
  adKey: string
  width: number
  height: number
}

export default function AdsterraFrame({ adKey, width, height }: AdsterraFrameProps) {
  if (!adKey) {
    return null
  }

  const adHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>body { margin: 0; padding: 0; background: transparent; }</style>
    </head>
    <body>
      <script>
        atOptions = {
          'key': '${adKey}',
          'format': 'iframe',
          'height': ${height},
          'width': ${width},
          'params': {}
        };
      </script>
      <script src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
    </body>
    </html>
  `

  return (
    <iframe
      srcDoc={adHTML}
      width={width}
      height={height}
      style={{ border: 'none' }}
      title="Advertisement"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  )
}

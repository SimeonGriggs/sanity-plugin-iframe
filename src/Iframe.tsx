import React, {useEffect, useState, useRef} from 'react'
import {SanityDocumentLike} from 'sanity'
import {Box, Flex, Text, Button, ThemeProvider, Card, Spinner} from '@sanity/ui'
import {UndoIcon, CopyIcon, LeaveIcon, MobileDeviceIcon} from '@sanity/icons'

import useCopyToClipboard from './hooks/useCopytoClipboard'

const sizes = {
  desktop: {backgroundColor: `white`, width: `100%`, height: `100%`, maxHeight: `100%`},
  mobile: {backgroundColor: `white`, width: 414, height: `100%`, maxHeight: 736},
}

export type IframeOptions = {
  url: string | ((document: SanityDocumentLike) => unknown)
  defaultSize?: 'desktop' | 'mobile'
  reload: {
    revision: boolean | number
    button: boolean
  }
  attributes?: Partial<{
    allow: string
    referrerPolicy: string
    sandbox: string
  }>
}

export type IframeProps = {
  document: {
    displayed: SanityDocumentLike
  }
  options: IframeOptions
}

function Iframe(props: IframeProps) {
  const {document: sanityDocument, options} = props
  const {url, defaultSize = `desktop`, reload, attributes = {}} = options
  const [displayUrl, setDisplayUrl] = useState(typeof url === 'string' ? url : ``)
  const [iframeSize, setIframeSize] = useState(defaultSize)
  const input = useRef()
  const iframe = useRef()
  const {displayed} = sanityDocument
  const [, copy] = useCopyToClipboard()

  function handleCopy() {
    if (!input?.current?.value) return

    copy(input.current.value)
  }

  function handleReload() {
    if (!iframe?.current) {
      return
    }

    // Funky way to reload an iframe without CORS issuies
    // eslint-disable-next-line no-self-assign
    iframe.current.src = iframe.current.src
  }

  // Reload on new revisions
  useEffect(() => {
    if (reload?.revision || reload?.revision == 0) {
      setTimeout(() => {
        handleReload()
      }, Number(reload?.revision))
    }
  }, [displayed._rev, reload?.revision])

  // Set initial URL and refresh on new revisions
  useEffect(() => {
    const getUrl = async () => {
      const resolveUrl = typeof url === 'function' ? await url(displayed) : ``

      // Only update state if URL has changed
      if (resolveUrl !== displayUrl) {
        setDisplayUrl(resolveUrl)
      }
    }

    if (typeof url === 'function') {
      getUrl()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed._rev])

  if (!displayUrl || typeof displayUrl !== 'string') {
    return (
      <ThemeProvider>
        <Flex padding={5} items="center" justify="center">
          <Spinner />
        </Flex>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <textarea
        style={{position: `absolute`, pointerEvents: `none`, opacity: 0}}
        ref={input}
        value={displayUrl}
        readOnly
        tabIndex={-1}
      />
      <Flex direction="column" style={{height: `100%`}}>
        <Card padding={2} borderBottom={1}>
          <Flex align="center" gap={2}>
            <Flex align="center" gap={1}>
              <Button
                fontSize={[1]}
                padding={2}
                tone="primary"
                mode={iframeSize === 'mobile' ? 'default' : 'ghost'}
                icon={MobileDeviceIcon}
                onClick={() => setIframeSize(iframeSize === 'mobile' ? 'desktop' : 'mobile')}
              />
            </Flex>
            <Box flex={1}>
              <Text size={0} textOverflow="ellipsis">
                {displayUrl}
              </Text>
            </Box>
            <Flex align="center" gap={1}>
              {reload?.button ? (
                <Button
                  fontSize={[1]}
                  padding={2}
                  icon={UndoIcon}
                  title="Reload"
                  aria-label="Reload"
                  onClick={() => handleReload()}
                />
              ) : null}
              <Button
                fontSize={[1]}
                icon={CopyIcon}
                padding={[2]}
                title="Copy"
                aria-label="Copy"
                onClick={() => handleCopy()}
              />
              <Button
                fontSize={[1]}
                icon={LeaveIcon}
                padding={[2]}
                text="Open"
                tone="primary"
                onClick={() => window.open(displayUrl)}
              />
            </Flex>
          </Flex>
        </Card>
        <Card tone="transparent" padding={iframeSize === 'mobile' ? 2 : 0} style={{height: `100%`}}>
          <Flex align="center" justify="center" style={{height: `100%`}}>
            <iframe
              ref={iframe}
              title="preview"
              style={sizes[iframeSize]}
              frameBorder="0"
              src={displayUrl}
              {...attributes}
            />
          </Flex>
        </Card>
      </Flex>
    </ThemeProvider>
  )
}

export default Iframe

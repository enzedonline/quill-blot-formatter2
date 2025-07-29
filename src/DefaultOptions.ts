import Options from './Options';
import IframeVideoSpec from './specs/IframeVideoSpec';
import ImageSpec from './specs/ImageSpec';

const closeButtonIcon = `<svg viewBox="0 0 16 16" fill="currentColor" style="height:100%;width:auto"><path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708"/></svg>`;
const okButtonIcon = `<svg viewBox="0 0 24 24" fill="currentcolor" style="height:100%;width:auto"><path fill-rule="evenodd" clip-rule="evenodd" d="M 12,24 C 6.34314,24 3.514716,24 1.757364,22.2426 0,20.48532 0,17.6568 0,12 0,6.34314 0,3.514716 1.757364,1.757364 3.514716,0 6.34314,0 12,0 17.6568,0 20.48532,0 22.2426,1.757364 24,3.514716 24,6.34314 24,12 24,17.6568 24,20.48532 22.2426,22.2426 20.48532,24 17.6568,24 12,24 Z M 16.83636,8.363604 c 0.35148,0.351468 0.35148,0.921324 0,1.272756 l -6,6 c -0.35148,0.35148 -0.92124,0.35148 -1.272756,0 l -2.4,-2.4 c -0.351468,-0.35148 -0.351468,-0.92124 0,-1.27272 0.351468,-0.35148 0.921324,-0.35148 1.272792,0 L 10.2,13.72716 15.56364,8.363604 c 0.35148,-0.351468 0.92124,-0.351468 1.27272,0 z" style="stroke-width:1.2" /></svg>`;
const infoButtonIcon = `<svg viewBox="0 0 512 512" fill="currentcolor" style="height:100%;width:auto"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" /></svg>`;

export const DefaultOptions: Options = {
  specs: [
    ImageSpec,
    IframeVideoSpec,
  ],
  overlay: {
    className: 'blot-formatter__overlay',
    style: {
      position: 'absolute',
      boxSizing: 'border-box',
      border: '1px dashed #444',
      backgroundColor: 'rgba(255, 255, 255, 0.35)',
      maxWidth: "100%"
    },
    sizeInfoStyle: {
      position: 'absolute',
      color: 'rgba(255, 255, 255, 0.7)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '1em',
      textWrap: 'nowrap',
      fontSize: '1rem',
      opacity: 0,
      lineHeight: 1.2,
    },
  },
  align: {
    allowAligning: true,
    alignments: ['left', 'center', 'right']
  },
  resize: {
    allowResizing: true,
    allowResizeModeChange: false,
    imageOversizeProtection: false,
    handleClassName: 'blot-formatter__resize-handle',
    handleStyle: {
      position: 'absolute',
      height: '12px',
      width: '12px',
      backgroundColor: 'white',
      border: '1px solid #777',
      boxSizing: 'border-box',
      opacity: '0.80',
    },
    useRelativeSize: false,
    minimumWidthPx: 25,
  },
  delete: {
    allowKeyboardDelete: true,
  },
  toolbar: {
    icons: {
      left: `<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line><line class="ql-stroke" x1="3" x2="13" y1="14" y2="14"></line><line class="ql-stroke" x1="3" x2="9" y1="4" y2="4"></line></svg>`,
      center: `<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line><line class="ql-stroke" x1="14" x2="4" y1="14" y2="14"></line><line class="ql-stroke" x1="12" x2="6" y1="4" y2="4"></line></svg>`,
      right: `<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line><line class="ql-stroke" x1="15" x2="5" y1="14" y2="14"></line><line class="ql-stroke" x1="15" x2="9" y1="4" y2="4"></line></svg>`,
      attribute: `<svg viewBox="0 0 24 24" fill="none" class="ql-stroke"><path d="M10 19H12M12 19H14M12 19V5M12 5H6V6M12 5H18V6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      resizeMode: `<svg viewBox="0 0 24 24" class="ql-stroke"><path d="m 7.7056591,11.853515 q -1.515179,0 -2.4160962,-0.993056 -0.9009172,-1.0032944 -0.9009172,-2.6720388 0,-1.8223098 0.9521057,-2.8665548 0.9521057,-1.0544826 2.5696616,-1.0544826 1.5663674,0 2.426334,0.9725811 0.870204,0.972581 0.870204,2.7334647 0,1.7608836 -0.972581,2.8256044 -0.9623435,1.054482 -2.5287109,1.054482 z M 7.8489868,5.3935293 q -0.9725811,0 -1.5356544,0.7268764 -0.5630732,0.7166387 -0.5630732,1.9758752 0,1.2387612 0.5528356,1.9349241 0.5528355,0.685926 1.5049412,0.685926 0.9623434,0 1.5049413,-0.716639 0.5425978,-0.7166384 0.5425978,-1.9861126 0,-1.2387612 -0.5425978,-1.9246868 Q 8.7806171,5.3935293 7.8489868,5.3935293 Z M 17.533847,4.4926121 8.1151669,19.275845 H 6.6511764 L 16.059619,4.4926121 Z M 16.448651,19.398697 q -1.515179,0 -2.416096,-1.003294 -0.900917,-1.003294 -0.900917,-2.661801 0,-1.82231 0.962343,-2.876793 0.962344,-1.06472 2.559424,-1.06472 1.55613,0 2.426334,0.982819 0.870204,0.982819 0.870204,2.75394 0,1.750646 -0.972581,2.815366 -0.962343,1.054483 -2.528711,1.054483 z m 0.143328,-6.449748 q -0.982819,0 -1.545892,0.716638 -0.552836,0.716639 -0.552836,1.986113 0,1.218286 0.552836,1.914449 0.552835,0.685926 1.504941,0.685926 0.962343,0 1.504941,-0.716639 0.542598,-0.726876 0.542598,-1.986113 0,-1.248998 -0.542598,-1.924686 -0.53236,-0.675688 -1.46399,-0.675688 z" style="fill:currentColor;stroke:currentColor;stroke-width:0.3"/></svg>`,
      compress: `<svg viewBox="0 0 28 28"><path d="m 19.250001,9.3125004 c 0.240623,0 0.437498,0.1968749 0.437498,0.4374991 V 18.49453 l -0.136717,-0.177734 -3.718751,-4.812498 c -0.123046,-0.161329 -0.317188,-0.254297 -0.51953,-0.254297 -0.202345,0 -0.39375,0.09297 -0.519532,0.254297 l -2.269532,2.936715 -0.833984,-1.167577 c -0.123047,-0.172265 -0.319922,-0.273437 -0.533204,-0.273437 -0.213281,0 -0.410156,0.101172 -0.533202,0.276172 l -2.1875003,3.0625 -0.1230462,0.169532 v -0.0082 -8.7500002 c 0,-0.2406242 0.1968749,-0.4374991 0.4374991,-0.4374991 z M 8.7499996,8 C 7.7847663,8 7,8.7847662 7,9.7499995 V 18.5 c 0,0.965233 0.7847663,1.75 1.7499996,1.75 H 19.250001 C 20.215235,20.25 21,19.465233 21,18.5 V 9.7499995 C 21,8.7847662 20.215235,8 19.250001,8 Z M 10.9375,13.250001 a 1.3125025,1.312501 0 1 0 0,-2.625002 1.3125025,1.312501 0 1 0 0,2.625002 z" /><path d="m 25.298508,20 h -3.58209 C 21.286567,20 21,20.286571 21,20.716427 v 3.582131 c 0,0.429856 0.286567,0.716426 0.716418,0.716426 v 0 c 0.429851,0 0.716418,-0.28657 0.716418,-0.716426 v -2.865705 h 2.865672 c 0.429851,0 0.716418,-0.28657 0.716418,-0.716426 C 26.014926,20.286571 25.728359,20 25.298508,20 Z" /><path d="M 6.298508,20 H 2.716418 C 2.2865673,20 2,20.286571 2,20.716427 c 0,0.429856 0.2865673,0.716426 0.716418,0.716426 H 5.58209 v 2.865705 c 0,0.429856 0.286567,0.716426 0.716418,0.716426 v 0 c 0.429851,0 0.716418,-0.28657 0.716418,-0.716426 V 20.716427 C 7.014926,20.286571 6.728359,20 6.298508,20 Z" /><path d="M 6.298507,3 C 5.868656,3 5.582089,3.28657 5.582089,3.716426 V 6.582131 H 2.716417 C 2.286567,6.582131 2,6.868702 2,7.298557 2,7.728413 2.286567,8.014984 2.716417,8.014984 h 3.58209 c 0.429845,0 0.716412,-0.286571 0.716412,-0.716427 V 3.716426 C 7.014919,3.28657 6.728352,3 6.298507,3 Z" /><path d="m 21.716418,8.014984 h 3.582089 c 0.429851,0 0.716418,-0.286571 0.716418,-0.716427 0,-0.429855 -0.286567,-0.716426 -0.716418,-0.716426 H 22.432836 V 3.716426 C 22.432836,3.28657 22.146269,3 21.716418,3 21.286567,3 21,3.28657 21,3.716426 v 3.582131 c 0,0.429856 0.286567,0.716427 0.716418,0.716427 z" /></svg>`,
      link: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" style="fill: none;stroke: #444;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5;"><line x1="7" x2="11" y1="7" y2="11"/><path class="ql-even" d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"/><path class="ql-even" d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"/></svg>`,
    },
    tooltips: {
      left: 'Align Left',
      center: 'Align Center',
      right: 'Align Right',
      attribute: 'Set Alt/Title',
      resizeMode: 'Resize Relative/Absolute',
      compress: 'Compress Image',
      link: 'Add/Edit Link',
    },
    mainClassName: 'blot-formatter__toolbar',
    mainStyle: {
      position: 'absolute',
      display: 'flex',
      top: '0',
      right: '0',
      left: '0',
      transform: 'translateY(-50%)',
      justifyContent: 'center',
      flexWrap: 'wrap',
      color: '#333',
      zIndex: '1',
    },
    buttonClassName: 'blot-formatter__toolbar-button',
    buttonStyle: {
      display: 'inline-block',
      width: '27px',
      height: '26px',
      background: 'white',
      border: '1px solid #999',
      cursor: 'pointer',
      margin: '0 -1px 0 0'
    },
    buttonSelectedClassName: 'blot-formatter__toolbar-button--selected',
    buttonSelectedStyle: {
      filter: 'invert(20%)',
    },
    svgStyle: {
      display: 'inline-block',
      width: '100%',
      height: '100%',
      background: 'white',
      verticalAlign: 'top',
    },
  },
  image: {
    allowAltTitleEdit: true,
    registerImageTitleBlot: false,
    registerArrowRightFix: true,
    altTitleModalOptions: {
      styles: {
        modalBackground: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        },
        modalContainer: {
          backgroundColor: '#f2f2f2',
          padding: '5px 10px 10px 10px',
          borderRadius: '5px',
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '6px 6px 5px #00000075'
        },
        label: {
          display: 'block',
          color: 'black',
          margin: '7px 0 5px 0',
          fontSize: '14px'
        },
        textarea: {
          backgroundColor: 'white',
          fontSize: '13px',
          display: 'block',
          resize: 'none',
          width: '100%',
          padding: '5px',
          border: '1px solid lightgray',
          borderRadius: '4px',
        },
        submitButton: {
          display: 'block',
          marginLeft: 'auto',
          marginTop: '5px',
          cursor: 'pointer',
          border: 0,
          padding: 0,
          width: '2rem',
          height: '2rem',
          color: '#198754'
        },
        cancelButton: {
          display: 'flex',
          width: '1.5rem',
          height: '1.5rem',
          position: 'absolute',
          padding: 0,
          top: '-0.7rem',
          right: '-0.7rem',
          background: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          alignItems: 'center',
          color: 'rgb(197, 74, 71)'
        },
      },
      icons: {
        submitButton: okButtonIcon,
        cancelButton: closeButtonIcon,
      },
      labels: {
        alt: 'Alt Text',
        title: 'Image Title'
      }
    },
    allowCompressor: false,
    compressorOptions: {
      jpegQuality: 0.8,
      styles: {
        modalBackground: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        },
        modalContainer: {
          backgroundColor: 'rgb(253, 253, 253)',
          border: '1px solid #ccc',
          boxShadow: '6px 6px 5px #00000075',
          padding: '15px',
          borderRadius: '8px',
          position: 'relative',
          maxWidth: 'min(90%, 400px)',
          textAlign: 'justify',
          userSelect: 'none',
        },
        buttonContainer: {
          gridTemplateColumns: 'auto 1fr auto',
          display: 'grid',
          gap: '1em',
          justifyItems: 'center',
          borderTop: '1px solid lightgray',
          paddingTop: '12px'
        },
        buttons: {
          width: '1.5rem',
          height: '1.5rem',
          padding: 0,
          backgroundColor: 'transparent',
          border: 0,
          cursor: 'pointer',
        }
      },
      buttons: {
        continue: {
          className: 'blot-formatter__compress-continue',
          style: {
            color: '#198754'
          }
        },
        cancel: {
          className: 'blot-formatter__compress-cancel',
          style: {
            color: 'rgb(197, 74, 71)'
          }
        },
        moreInfo: {
          className: 'blot-formatter__compress-more-info',
          style: {
            color: 'royalblue'
          }
        }
      },
      text: {
        prompt: `<h5>Compress image to its resized width?</h5>`,
        moreInfo: `<p style="font-size: smaller; line-height: 1.2;">You can reduce the file size and save disk space by compressing pictures. The compression reduces both the file size and picture dimensions based on the width setting.</p><p style="font-size: smaller;"><strong>NOTE:</strong> This process cannot be undone.</p>`,
        reducedLabel: 'Reduced',
        nothingToDo: 'Image already optimised.'
      },
      icons: {
        cancel: `<span style="color: rgb(197, 74, 71);">${closeButtonIcon}</span>`,
        moreInfo: infoButtonIcon,
        continue: okButtonIcon
      }
    },
    linkOptions: {
      allowLinkEdit: true,
      modal: {
        className: 'blot-formatter__link-modal',
        dialogStyle: { // NOTE: positioning handled programatically
          margin: 0,
          backgroundColor: '#fdfdfd',
          border: '1px solid #ccc',
          boxShadow: '6px 6px 5px #00000075',
          color: '#444',
          padding: '6px 13px 6px 10px',
          whiteSpace: 'nowrap',
          borderRadius: '5px',
          minWidth: '300px',
          maxWidth: '90%',
          overflow: 'visible',
          zIndex: 101, // Ensure it is above the background
        },
        backgroundClassName: 'blot-formatter__link-modal-background',
        backgroundStyle: {
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
        },
        formClassName: 'blot-formatter__link-form',
        formStyle: {
          display: 'flex',
          flexWrap: 'nowrap',
          columnGap: '5px',
          alignItems: 'baseline',
        },
        labelText: 'URL:',
        labelStyle: {
          paddingRight: '5px',
          fontSize: '13px',
        },
        inputPlaceholder: 'https://example.com',
        inputStyle: {
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '13px',
          height: '25px',
          margin: 0,
          padding: '3px 5px',
          width: '100%',
          outline: '1px auto #df9001c2',
        },
        buttons: {
          submit: {
            className: 'blot-formatter__link-submit',
            style: {
              border: 'none',
              borderRadius: '3px',
              padding: '0',
              cursor: 'pointer',
              background: 'transparent',
              width: '26px',
              height: '26px',
              color: '#198754'
            },
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" style="height:100%;width:auto"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/><path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>`,
            tooltip: 'Create Link'
          },
          cancel: {
            className: 'blot-formatter__link-cancel',
            style: {
              display: 'flex',
              width: '18px',
              height: '18px',
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              padding: '0',
              background: 'white',
              border: '1px solid rgb(157, 58, 56)',
              borderRadius: '5px',
              cursor: 'pointer',
              alignItems: 'center',
              color: 'rgb(197, 74, 71)',
            },
            icon: closeButtonIcon,
            tooltip: 'Cancel'
          },
          remove: {
            className: 'blot-formatter__link-remove',
            style: {
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              background: 'transparent',
              width: '26px',
              height: '26px',
              fill: '#c54a47',
            },
            icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="height:100%;width:auto"><path d="M 6.265625,3.3457031 6.125,3.625 H 4.25 c -0.3457031,0 -0.625,0.2792969 -0.625,0.625 0,0.3457031 0.2792969,0.625 0.625,0.625 h 7.5 c 0.345703,0 0.625,-0.2792969 0.625,-0.625 0,-0.3457031 -0.279297,-0.625 -0.625,-0.625 H 9.875 L 9.734375,3.3457031 C 9.6289062,3.1328125 9.4121094,3 9.1757812,3 H 6.8242188 C 6.5878906,3 6.3710938,3.1328125 6.265625,3.3457031 Z M 11.75,5.5 h -7.5 l 0.4140625,6.621094 C 4.6953125,12.615234 5.1054688,13 5.5996094,13 h 4.8007816 c 0.49414,0 0.904297,-0.384766 0.935547,-0.878906 z" style="display:inline;stroke-width:0.0195312"/><path d="m 14,1 a 1,1 0 0 1 1,1 v 12 a 1,1 0 0 1 -1,1 H 2 A 1,1 0 0 1 1,14 V 2 A 1,1 0 0 1 2,1 Z M 2,0 A 2,2 0 0 0 0,2 v 12 a 2,2 0 0 0 2,2 h 12 a 2,2 0 0 0 2,-2 V 2 A 2,2 0 0 0 14,0 Z" style="display:inline"/></svg>`,
            tooltip: 'Remove Link'
          }
        }
      }
    }
  },
  video: {
    selector: 'iframe.ql-video',
    registerCustomVideoBlot: false,
    registerBackspaceFix: true,
    defaultAspectRatio: '16/9 auto',
    proxyStyle: {}
  }
};

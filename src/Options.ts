import BlotSpec from './specs/BlotSpec';
import ImageSpec from './specs/ImageSpec';
import IframeVideoSpec from './specs/IframeVideoSpec';

type Constructor<T> = new (...args: any[]) => T;

export type OverlayOptions = {
  // classname applied to the overlay element
  className: string,
  // style applied to overlay element, or null to prevent styles
  style?: { [key: string]: any } | null | undefined
  // style applied to overlay size info element, or null to prevent styles
  sizeInfoStyle?: { [key: string]: any } | null | undefined
  // String literal labels rendered in the user interface - legacy use only
  labels?: { [key: string]: any } | null | undefined,
};

export type ResizeOptions = {
  // allow blot resizing - all other options except allowResizeModeChange irrelevent if false
  allowResizing: boolean;
  // show % button to allow change between absolute and relative
  // when aligning, and blot has a width attribute, allowResizeModeChange=false will set width according to useRelativeSize
  allowResizeModeChange: boolean;
  // class name applied to the resize handles
  handleClassName: string,
  // style applied to resize handles, or null to prevent styles
  handleStyle?: { [key: string]: any } | null | undefined
  // width is set as % rather than px (% of quill root width minus padding)
  // if allowResizeModeChange=false, any resized blot will use this
  // if allowResizeModeChange=true, only previously unsized blots will use this
  useRelativeSize: boolean;
  // minimum width a blot can be resized to (px)
  minimumWidthPx: number;
};

export type AlignOptions = {
  // allow blot aligning - all other options irrelevent if false
  allowAligning: boolean;
  // alignment names to use - must match icon name & be a member of align format whitelist
  alignments: string[];
};

export type DeleteOptions = {
  // allow deleting blot with delete/backspace while overlay active
  allowKeyboardDelete: boolean;
}

export type ToolbarOptions = {
  // toolbar icons - key name must match toolbar button name or alignment name if relevant 
  icons: Record<string, string>,
  // class name applied to the root toolbar element
  mainClassName: string,
  // style applied to root toolbar element, or null to prevent styles
  mainStyle?: { [key: string]: any } | null | undefined,
  // style applied to buttons, or null to prevent styles
  buttonStyle?: { [key: string]: any } | null | undefined,
  // class name applied to each button in the toolbar
  buttonClassName: string,
  // style applied to the svgs in the buttons
  svgStyle?: { [key: string]: any } | null | undefined,
};

type AltTitleModalOptions = {
  styles?: {
    // style for screen background mask
    modalBackground?: { [key: string]: any } | null | undefined;
    // style for modal dialog
    modalContainer?: { [key: string]: any } | null | undefined;
    // style for form labels
    label?: { [key: string]: any } | null | undefined;
    // textarea styles
    textarea?: { [key: string]: any } | null | undefined;
    // style for submit button
    submitButton?: { [key: string]: any } | null | undefined;
    // style for cancel button
    cancelButton?: { [key: string]: any } | null | undefined;
  } | null | undefined;
  icons: {
    // inner html for buttons (svg recommended)
    submitButton: string;
    cancelButton: string;
  };
  labels: {
    // text for labels (for multi-lang support)
    alt: string;
    title: string;
  };
}

export type ImageOptions = {
  // show T button for image alt/title editing
  allowAltTitleEdit: Boolean;
  // Register custom Quill Blot for image with suport for title attribute
  registerImageTitleBlot: Boolean;
  // styles for the alt/title modal
  altTitleModalOptions: AltTitleModalOptions;
  // Register ArrowRight keyboard binding to handle moving cursor past formatted image
  registerArrowRightFix: Boolean;
}

export type VideoOptions = {
  // query selector string to select unclickable blots
  selector: string;
  // register custom Quill Blot with width: 100% and support for aspect ratio attribute
  registerCustomVideoBlot: Boolean;
  // custom keyboard binding to handle backspace between two contiguous video blots (Quill bug fix)
  registerBackspaceFix: Boolean;
  // default video aspect ratio to use if none supplied, also used when registering custom video blot
  defaultAspectRatio: string;
  // additional styles applied to proxy image, or null to prevent styles
  proxyStyle: { [key: string]: any };
}

export type Options = {
  // the BlotSpecs supported
  specs: Array<Constructor<BlotSpec>>,
  overlay: OverlayOptions,
  align: AlignOptions,
  resize: ResizeOptions,
  delete: DeleteOptions,
  toolbar: ToolbarOptions,
  image: ImageOptions,
  video: VideoOptions,
};

const DefaultOptions: Options = {
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
      padding: '0.5em',
      textWrap: 'nowrap',
      fontSize: '1rem',
      opacity: 0
    },
  },
  align: {
    allowAligning: true,
    alignments: ['left', 'center', 'right']
  },
  resize: {
    allowResizing: true,
    allowResizeModeChange: false,
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
      left: `
        <svg viewbox="0 0 18 18">
          <line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line>
          <line class="ql-stroke" x1="3" x2="13" y1="14" y2="14"></line>
          <line class="ql-stroke" x1="3" x2="9" y1="4" y2="4"></line>
        </svg>
      `,
      center: `
        <svg viewbox="0 0 18 18">
          <line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line>
          <line class="ql-stroke" x1="14" x2="4" y1="14" y2="14"></line>
          <line class="ql-stroke" x1="12" x2="6" y1="4" y2="4"></line>
        </svg>
      `,
      right: `
        <svg viewbox="0 0 18 18">
          <line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line>
          <line class="ql-stroke" x1="15" x2="5" y1="14" y2="14"></line>
          <line class="ql-stroke" x1="15" x2="9" y1="4" y2="4"></line>
        </svg>
      `,
      attribute: `
        <svg viewBox="0 0 24 24" fill="none" class="ql-stroke">
          <path d="M10 19H12M12 19H14M12 19V5M12 5H6V6M12 5H18V6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      resizeMode: `
        <svg viewBox="0 0 24 24" class="ql-stroke">
          <path
            d="m 7.7056591,11.853515 q -1.515179,0 -2.4160962,-0.993056 -0.9009172,-1.0032944 -0.9009172,-2.6720388 0,-1.8223098 0.9521057,-2.8665548 0.9521057,-1.0544826 2.5696616,-1.0544826 1.5663674,0 2.426334,0.9725811 0.870204,0.972581 0.870204,2.7334647 0,1.7608836 -0.972581,2.8256044 -0.9623435,1.054482 -2.5287109,1.054482 z M 7.8489868,5.3935293 q -0.9725811,0 -1.5356544,0.7268764 -0.5630732,0.7166387 -0.5630732,1.9758752 0,1.2387612 0.5528356,1.9349241 0.5528355,0.685926 1.5049412,0.685926 0.9623434,0 1.5049413,-0.716639 0.5425978,-0.7166384 0.5425978,-1.9861126 0,-1.2387612 -0.5425978,-1.9246868 Q 8.7806171,5.3935293 7.8489868,5.3935293 Z M 17.533847,4.4926121 8.1151669,19.275845 H 6.6511764 L 16.059619,4.4926121 Z M 16.448651,19.398697 q -1.515179,0 -2.416096,-1.003294 -0.900917,-1.003294 -0.900917,-2.661801 0,-1.82231 0.962343,-2.876793 0.962344,-1.06472 2.559424,-1.06472 1.55613,0 2.426334,0.982819 0.870204,0.982819 0.870204,2.75394 0,1.750646 -0.972581,2.815366 -0.962343,1.054483 -2.528711,1.054483 z m 0.143328,-6.449748 q -0.982819,0 -1.545892,0.716638 -0.552836,0.716639 -0.552836,1.986113 0,1.218286 0.552836,1.914449 0.552835,0.685926 1.504941,0.685926 0.962343,0 1.504941,-0.716639 0.542598,-0.726876 0.542598,-1.986113 0,-1.248998 -0.542598,-1.924686 -0.53236,-0.675688 -1.46399,-0.675688 z"
            style="fill:currentColor;stroke:currentColor;stroke-width:0.3"
          />
        </svg>
      `
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
          maxWidth: '500px'
        },
        label: {
          display: 'block',
          color: 'black',
          margin: '10px 0 5px 0',
          fontSize: '0.9em'
        },
        textarea: {
          backgroundColor: 'white',
          display: 'block',
          resize: 'none',
          width: '100%',
          padding: '5px'
        },
        submitButton: {
          display: 'block',
          marginLeft: 'auto',
          marginTop: '5px',
          cursor: 'pointer',
          border: 0,
          padding: 0,
          width: '2.5rem',
          height: '2.5rem',
          fill: 'green'
        },
        cancelButton: {
          display: 'flex',
          width: '2rem',
          height: '2rem',
          position: 'absolute',
          top: '-0.7rem',
          right: '-0.7rem',
          background: 'white',
          border: '1px solid gray',
          borderRadius: '5px',
          cursor: 'pointer',
          alignItems: 'center',
          fill: 'red'
        },
      },
      icons: {
        submitButton: `
        <svg viewBox="0 0 24 24">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z"></path>
        </svg>`,
        cancelButton: `
        <svg viewBox="0 0 384 512">   
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
        </svg>`,
      },
      labels: {
        alt: 'Alt Text',
        title: 'Image Title'
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

export default DefaultOptions;

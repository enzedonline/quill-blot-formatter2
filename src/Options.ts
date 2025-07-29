import BlotSpec from './specs/BlotSpec';
import { DefaultOptions } from './DefaultOptions';

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
  // prevent images being resized larger than their natural size
  imageOversizeProtection: boolean;
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
  // toolbar tooltips - key name must match toolbar button name or alignment name if relevant
  tooltips?: Record<string, string> | null | undefined,
  // class name applied to the root toolbar element
  mainClassName: string,
  // style applied to root toolbar element, or null to prevent styles
  mainStyle?: { [key: string]: any } | null | undefined,
  // style applied to buttons, or null to prevent styles
  buttonStyle?: { [key: string]: any } | null | undefined,
  // class name applied to each button in the toolbar
  buttonClassName: string,
  // style applied to selected buttons, or null to prevent styles
  buttonSelectedStyle?: { [key: string]: any } | null | undefined,
  // class name applied to each selected button in the toolbar
  buttonSelectedClassName: string,
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

export type CompressorOptions = {
  // jpeg compression factor [0-1]: 0 = absolute, 1 = no compression
  jpegQuality: number;
  // maximum width (px) for images with no width attribute, or for relative sized images
  maxWidth?: number | null; // leave null to disable this feature
  styles?: {
    // style for screen background mask
    modalBackground?: { [key: string]: any } | null | undefined;
    // style for modal dialog
    modalContainer?: { [key: string]: any } | null | undefined;
    // style for button layout
    buttonContainer?: { [key: string]: any } | null | undefined;
    // style for buttons
    buttons?: { [key: string]: any } | null | undefined;
  } | null | undefined;
  buttons: {
    continue: {
      className: string; // class name applied to the continue button
      style?: { [key: string]: any } | null | undefined; // style applied to the continue button, or null to prevent styles
    },
    cancel: {
      className: string; // class name applied to the cancel button
      style?: { [key: string]: any } | null | undefined; // style applied to the cancel button, or null to prevent styles
    },
    moreInfo: {
      className: string; // class name applied to the more info button
      style?: { [key: string]: any } | null | undefined; // style applied to the more info button, or null to prevent styles
    }
  };
  text: {
    // text (or html) for the modal text content
    prompt: string;
    moreInfo: string | null; // set to null to disable 'More Info' button
    reducedLabel: string; // pop-up label text prefixing reduced ammount
    nothingToDo: string; // message if image already optimised
  };
  icons: {
    // inner html for buttons (svg recommended)
    continue: string;
    moreInfo: string;
    cancel: string;
  };
}

export type LinkOptions = {
  // show link button for adding/editing links
  allowLinkEdit: Boolean;
  modal: {
    dialog: {
      className: string; // class name applied to the link modal dialog
      style?: { [key: string]: any } | null | undefined; // style applied to the modal dialog, or null to prevent styles
    };
    background: {
      className: string; // class name for screen background mask
      style?: { [key: string]: any } | null | undefined; // style for screen background mask
    };
    form: {
      className: string; // class name applied to the form element
      style?: { [key: string]: any } | null | undefined; // style applied to the form, or null to prevent styles
    };
    label: {
      className: string; // class name applied to the label element
      style?: { [key: string]: any } | null | undefined; // style applied to the label, or null to prevent styles
      text: string; // text content for the label element
    };
    input: {
      className: string; // class name applied to the input element
      style?: { [key: string]: any } | null | undefined; // style applied to the input, or null to prevent styles
      placeholder?: string | null | undefined; // placeholder text for the input
    };
    buttons: {
      submit: {
        className: string; // class name applied to the submit button
        style?: { [key: string]: any } | null | undefined; // style applied to the submit button, or null to prevent styles
        icon: string; // inner html for submit button (svg recommended)
        tooltip: string; // tooltip text for submit button
      },
      cancel: {
        className: string; // class name applied to the cancel button
        style?: { [key: string]: any } | null | undefined; // style applied to the cancel button, or null to prevent styles
        icon: string; // inner html for cancel button (svg recommended)
        tooltip: string; // tooltip text for cancel button
      },
      remove: {
        className: string; // class name applied to the remove button
        style?: { [key: string]: any } | null | undefined; // style applied to the remove button, or null to prevent styles
        icon: string; // inner html for remove button (svg recommended)
        tooltip: string; // tooltip text for remove button
      }
    }
  }
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
  // enable compressor action for embedded images
  allowCompressor: Boolean;
  // options for the image compressor
  compressorOptions: CompressorOptions;
  // options for the link action
  linkOptions: LinkOptions;
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

type Options = {
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

export default Options;


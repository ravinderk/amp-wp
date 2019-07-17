/**
 * Custom component for BlockDropZone for being able to position inner blocks via drag and drop.
 * Parts of this are taken from the original BlockDropZone component.
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import {
	DropZone,
} from '@wordpress/components';
import { Component } from '@wordpress/element';
import { withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getPercentageFromPixels } from '../helpers';
import {
	STORY_PAGE_INNER_HEIGHT,
	TEXT_BLOCK_BORDER,
} from '../constants';

const wrapperElSelector = 'div[data-amp-selected="parent"] .editor-inner-blocks';

class BlockDropZone extends Component {
	constructor() {
		super( ...arguments );

		this.onDrop = this.onDrop.bind( this );
	}

	onDrop( event ) {
		const { srcBlockName } = this.props;
		if ( 'amp/amp-story-cta' === srcBlockName ) {
			this.onCTAButtonDrop( event );
		} else {
			this.onMovableBlockDrop( event );
		}
	}

	onCTAButtonDrop( event ) {
		const { updateBlockAttributes, srcClientId } = this.props;

		const elementId = `amp-story-cta-button-${ srcClientId }`;
		const cloneElementId = `clone-amp-story-cta-button-${ srcClientId }`;
		const element = document.getElementById( elementId );
		const clone = document.getElementById( cloneElementId );
		const btnWrapperSelector = `#block-${ srcClientId } .editor-block-list__block-edit`;

		// Get the editor wrapper element for calculating the width and height.
		const wrapperEl = document.querySelector( btnWrapperSelector );
		if ( ! element || ! clone || ! wrapperEl ) {
			event.preventDefault();
			return;
		}

		const clonePosition = clone.getBoundingClientRect();
		const wrapperPosition = wrapperEl.getBoundingClientRect();

		// Let's get the base value to measure the percentage from.
		const baseHeight = STORY_PAGE_INNER_HEIGHT / 5;

		// We will set the new position based on where the button's clone was moved to, with reference being the CTA block itself.
		updateBlockAttributes( srcClientId, {
			btnPositionLeft: getPercentageFromPixels( 'x', clonePosition.left - wrapperPosition.left ),
			btnPositionTop: clonePosition.top - wrapperPosition.top > 0 ? getPercentageFromPixels( 'y', clonePosition.top - wrapperPosition.top, baseHeight ) : 0,
		} );
	}

	onMovableBlockDrop( event ) {
		const { updateBlockAttributes, srcBlockName, srcClientId } = this.props;

		const elementId = `block-${ srcClientId }`;
		const cloneElementId = `clone-block-${ srcClientId }`;
		const element = document.getElementById( elementId );
		const clone = document.getElementById( cloneElementId );

		// Get the editor wrapper element for calculating the width and height.
		const wrapperEl = document.querySelector( wrapperElSelector );
		if ( ! element || ! clone || ! wrapperEl ) {
			event.preventDefault();
			return;
		}

		// We have to remove the rotation for getting accurate position.
		clone.parentNode.style.visibility = 'hidden';
		clone.parentNode.style.transform = 'none';
		const clonePosition = clone.getBoundingClientRect();
		const wrapperPosition = wrapperEl.getBoundingClientRect();

		// We will set the new position based on where the clone was moved to, with reference being the wrapper element.
		// Lets take the % based on the wrapper for top and left.
		const possibleDelta = 'amp/amp-story-text' === srcBlockName ? TEXT_BLOCK_BORDER : 0;
		updateBlockAttributes( srcClientId, {
			positionLeft: getPercentageFromPixels( 'x', clonePosition.left - wrapperPosition.left + possibleDelta ),
			positionTop: getPercentageFromPixels( 'y', clonePosition.top - wrapperPosition.top + possibleDelta ),
		} );
	}

	render() {
		return (
			<DropZone
				className="editor-block-drop-zone"
				onDrop={ this.onDrop }
			/>
		);
	}
}

BlockDropZone.propTypes = {
	updateBlockAttributes: PropTypes.func,
	srcClientId: PropTypes.string,
	srcBlockName: PropTypes.string,
};

export default withDispatch( ( dispatch ) => {
	const { updateBlockAttributes } = dispatch( 'core/block-editor' );

	return {
		updateBlockAttributes( ...args ) {
			updateBlockAttributes( ...args );
		},
	};
} )( BlockDropZone );

import { render, screen } from '@testing-library/react'

import { FieldLegend } from '..'

const PROPS: PropsOf<typeof FieldLegend> = { children: 'Personal details' }

describe('<FieldLegend />', () => {
  it('renders children', () => {
    render(
      <fieldset>
        <FieldLegend {...PROPS} />
      </fieldset>,
    )
    expect(screen.getByText(PROPS.children as string)).toBeVisible()
  })

  it('has data-slot="field-legend" and defaults to legend variant', () => {
    render(
      <fieldset>
        <FieldLegend {...PROPS} />
      </fieldset>,
    )
    const legend = screen.getByText(PROPS.children as string)
    expect(legend).toHaveAttribute('data-slot', 'field-legend')
    expect(legend).toHaveAttribute('data-variant', 'legend')
  })

  it('sets data-variant when variant is label', () => {
    render(
      <fieldset>
        <FieldLegend {...PROPS} variant="label" />
      </fieldset>,
    )
    expect(screen.getByText(PROPS.children as string)).toHaveAttribute('data-variant', 'label')
  })

  it('merges className onto the legend element', () => {
    render(
      <fieldset>
        <FieldLegend {...PROPS} className="custom-class" />
      </fieldset>,
    )
    expect(screen.getByText(PROPS.children as string)).toHaveClass('custom-class')
  })

  it('forwards props to the legend element', () => {
    render(
      <fieldset>
        <FieldLegend {...PROPS} id="legend-id" />
      </fieldset>,
    )
    expect(screen.getByText(PROPS.children as string)).toHaveAttribute('id', 'legend-id')
  })
})

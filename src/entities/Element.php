<?php

namespace MyApp\Entities;

/**
 * @Entity(repositoryClass="MyApp\Entities\Repositories\ElementRepository")
 * @Table(name="website_elements")
 */
class Element {
	/**
	 * @Id @Column(type="integer")
	 *
	 */
	private $id;
	/** @Column(type="text") */
	private $name;
	/** @Column(type="text") */
	private $summary_nl;
	/** @Column(type="text") */
	private $geom; //todo: give type geometry
	/**
	 * @Id
	 * @ManyToOne(targetEntity="Layer")
	 * @JoinColumn(name="layer_id")
	 */
	private $layer;

	public function getName() {
		return $this->name;
	}

	public function getSummary() {
		return $this->summary_nl;
	}

	public function getGeometry() {
		return $this->geom;
	}

	public function getLayer() {
		return $this->layer;
	}
}
